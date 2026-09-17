import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get inventory overview for all products in the tenant.
   * Returns each variant with current stock levels and recent movements.
   */
  async getInventoryOverview(tenantId: bigint, query?: {
    lowStock?: boolean;
    search?: string;
  }) {
    const where: any = {
      variant: {
        product: { tenantId, deletedAt: null, active: true },
        active: true,
      },
    };



    const inventoryItems = await this.prisma.inventory.findMany({
      where: {
        variant: {
          product: { tenantId, deletedAt: null },
          active: true,
        },
      },
      include: {
        variant: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                brand: true,
                weight: true,
                description: true,
                images: { take: 1, select: { url: true } },
                productCategories: {
                  include: {
                    category: {
                      select: {
                        id: true,
                        name: true,
                        slug: true,
                      },
                    },
                  },
                },
              },
            },
            prices: { where: { isActive: true }, take: 1 },
          },
        },
      },
    });

    let items = inventoryItems.map((item) => ({
      id: item.id.toString(),
      variantId: item.variantId.toString(),
      product: {
        id: item.variant.product.id.toString(),
        name: item.variant.product.name,
        slug: item.variant.product.slug,
        brand: item.variant.product.brand,
        weight: item.variant.product.weight ? Number(item.variant.product.weight) : null,
        description: item.variant.product.description,
        imageUrl: item.variant.product.images?.[0]?.url || null,
        category: item.variant.product.productCategories?.[0]?.category?.name || 'Accesorios',
      },
      sku: item.variant.sku,
      variantName: item.variant.name,
      price: item.variant.prices[0] ? Number(item.variant.prices[0].price) : 0,
      availableStock: item.availableStock,
      reservedStock: item.reservedStock,
      totalStock: item.availableStock + item.reservedStock,
      minimumStock: item.minimumStock,
      isLowStock: item.availableStock > 0 && item.availableStock <= item.minimumStock,
      isOutOfStock: item.availableStock === 0,
      updatedAt: item.updatedAt,
    }));

    // Filter by search
    if (query?.search) {
      const searchLower = query.search.toLowerCase();
      items = items.filter(
        (item) =>
          item.product.name.toLowerCase().includes(searchLower) ||
          item.sku.toLowerCase().includes(searchLower) ||
          (item.variantName && item.variantName.toLowerCase().includes(searchLower)),
      );
    }

    // Filter low stock only
    if (query?.lowStock) {
      items = items.filter((item) => item.isLowStock || item.isOutOfStock);
    }

    // Summary stats
    const summary = {
      totalVariants: items.length,
      totalStock: items.reduce((sum, item) => sum + item.totalStock, 0),
      totalAvailable: items.reduce((sum, item) => sum + item.availableStock, 0),
      totalReserved: items.reduce((sum, item) => sum + item.reservedStock, 0),
      lowStockCount: items.filter((item) => item.isLowStock).length,
      outOfStockCount: items.filter((item) => item.isOutOfStock).length,
    };

    return { items, summary };
  }

  /**
   * Get recent inventory movements for the tenant.
   */
  async getMovements(tenantId: bigint, query?: {
    variantId?: string;
    movementType?: string;
    limit?: number;
  }) {
    const where: any = { tenantId };

    if (query?.variantId) {
      where.variantId = BigInt(query.variantId);
    }

    if (query?.movementType) {
      where.movementType = query.movementType;
    }

    const movements = await this.prisma.inventoryMovement.findMany({
      where,
      include: {
        variant: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                brand: true,
                images: { take: 1, select: { url: true } },
              },
            },
          },
        },
        user: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: query?.limit || 50,
    });

    return movements.map((m) => ({
      id: m.id.toString(),
      variantId: m.variantId.toString(),
      product: {
        id: m.variant.product.id.toString(),
        name: m.variant.product.name,
        slug: m.variant.product.slug,
        brand: m.variant.product.brand,
        imageUrl: m.variant.product.images?.[0]?.url || null,
      },
      sku: m.variant.sku,
      variantName: m.variant.name,
      movementType: m.movementType,
      quantity: m.quantity,
      stockBefore: m.stockBefore,
      stockAfter: m.stockAfter,
      referenceType: m.referenceType,
      referenceId: m.referenceId?.toString(),
      note: m.note,
      createdBy: m.user,
      createdAt: m.createdAt,
    }));
  }

  /**
   * Register a manual stock movement (adjustment, purchase, return).
   *
   * Movement types:
   *   PURCHASE  — incoming stock from supplier
   *   RETURN    — customer return
   *   ADJUSTMENT — manual correction
   *   MERMAS    — shrinkage/damage
   */
  async registerMovement(tenantId: bigint, userId: bigint, data: {
    variantId: string;
    movementType: 'PURCHASE' | 'RETURN' | 'ADJUSTMENT' | 'MERMAS';
    quantity: number; // positive for incoming, negative for outgoing
    note?: string;
  }) {
    const variantId = BigInt(data.variantId);

    // Verify variant belongs to tenant
    const variant = await this.prisma.productVariant.findFirst({
      where: {
        id: variantId,
        product: { tenantId, deletedAt: null },
      },
      include: { inventory: true },
    });

    if (!variant) {
      throw new NotFoundException('Variante de producto no encontrada');
    }

    if (!variant.inventory) {
      throw new BadRequestException('Esta variante no tiene inventario configurado');
    }

    const quantity = data.quantity;
    const currentAvailable = variant.inventory.availableStock;

    // Validate quantity based on movement type
    if (data.movementType === 'MERMAS' && quantity > 0) {
      throw new BadRequestException('Las mermas deben tener cantidad negativa (ej. -5)');
    }

    if (data.movementType === 'MERMAS' && Math.abs(quantity) > currentAvailable) {
      throw new BadRequestException(
        `No se pueden registrar mermas de ${Math.abs(quantity)} unidades. Stock disponible: ${currentAvailable}`,
      );
    }

    if (data.movementType === 'ADJUSTMENT') {
      // Adjustments can be positive or negative, but can't go below 0
      const newStock = currentAvailable + quantity;
      if (newStock < 0) {
        throw new BadRequestException(
          `El ajuste resultaría en stock negativo (${newStock}). Stock actual: ${currentAvailable}`,
        );
      }
    }

    const newAvailableStock = currentAvailable + quantity;

    return this.prisma.$transaction(async (tx) => {
      // 1. Update inventory
      const updatedInventory = await tx.inventory.update({
        where: { id: variant.inventory.id },
        data: { availableStock: newAvailableStock },
      });

      // 2. Log movement
      const movement = await tx.inventoryMovement.create({
        data: {
          tenantId,
          variantId,
          movementType: data.movementType,
          quantity,
          stockBefore: currentAvailable,
          stockAfter: newAvailableStock,
          referenceType: 'MANUAL',
          note: data.note || `Movimiento manual: ${data.movementType}`,
          createdBy: userId,
        },
      });

      return {
        movement: {
          id: movement.id.toString(),
          movementType: movement.movementType,
          quantity: movement.quantity,
          stockBefore: movement.stockBefore,
          stockAfter: movement.stockAfter,
          note: movement.note,
          createdAt: movement.createdAt,
        },
        inventory: {
          availableStock: updatedInventory.availableStock,
          reservedStock: updatedInventory.reservedStock,
          totalStock: updatedInventory.availableStock + updatedInventory.reservedStock,
        },
      };
    });
  }

  /**
   * Update minimum stock threshold for a variant.
   */
  async updateMinimumStock(tenantId: bigint, variantId: bigint, minimumStock: number) {
    if (minimumStock < 0) {
      throw new BadRequestException('El stock mínimo no puede ser negativo');
    }

    const inventory = await this.prisma.inventory.findFirst({
      where: {
        variantId,
        variant: {
          product: { tenantId, deletedAt: null },
        },
      },
    });

    if (!inventory) {
      throw new NotFoundException('Inventario no encontrado para esta variante');
    }

    return this.prisma.inventory.update({
      where: { id: inventory.id },
      data: { minimumStock },
    });
  }
}
