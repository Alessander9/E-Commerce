import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get or create the user's cart for the current tenant.
   */
  async getOrCreateCart(tenantId: bigint, userId: bigint) {
    let cart = await this.prisma.cart.findFirst({
      where: { tenantId, userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    brand: true,
                  },
                },
                prices: { where: { isActive: true }, take: 1 },
                inventory: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { tenantId, userId },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                      brand: true,
                    },
                  },
                  prices: { where: { isActive: true }, take: 1 },
                  inventory: true,
                },
              },
            },
          },
        },
      });
    }

    // Calculate totals
    let subtotal = 0;
    let totalItems = 0;

    const items = cart.items.map((item) => {
      const unitPrice = Number(item.unitPriceSnapshot);
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;
      totalItems += item.quantity;

      return {
        id: item.id.toString(),
        quantity: item.quantity,
        unitPrice,
        lineTotal,
        variant: {
          id: item.variant.id.toString(),
          sku: item.variant.sku,
          name: item.variant.name,
          product: item.variant.product,
          price: item.variant.prices[0] ? Number(item.variant.prices[0].price) : unitPrice,
          compareAtPrice: item.variant.prices[0]?.compareAtPrice
            ? Number(item.variant.prices[0].compareAtPrice)
            : null,
          inStock: item.variant.inventory
            ? item.variant.inventory.availableStock > 0
            : true,
          availableStock: item.variant.inventory?.availableStock || 0,
        },
        addedAt: item.addedAt,
      };
    });

    return {
      id: cart.id.toString(),
      items,
      summary: {
        totalItems,
        subtotal,
        itemCount: items.length,
      },
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  /**
   * Add an item to the user's cart.
   */
  async addItem(tenantId: bigint, userId: bigint, data: {
    variantId: string;
    quantity?: number;
  }) {
    const variantId = BigInt(data.variantId);
    const quantity = data.quantity || 1;

    if (quantity < 1) {
      throw new BadRequestException('La cantidad debe ser al menos 1');
    }

    // Verify variant exists and belongs to tenant
    const variant = await this.prisma.productVariant.findFirst({
      where: {
        id: variantId,
        active: true,
        product: { tenantId, deletedAt: null, active: true },
      },
      include: {
        prices: { where: { isActive: true }, take: 1 },
        inventory: true,
      },
    });

    if (!variant) {
      throw new NotFoundException('Variante de producto no encontrada');
    }

    if (!variant.prices[0]) {
      throw new BadRequestException('Esta variante no tiene precio activo');
    }

    // Check stock
    if (variant.inventory && variant.inventory.availableStock < quantity) {
      throw new BadRequestException(
        `Stock insuficiente. Disponible: ${variant.inventory.availableStock}`,
      );
    }

    // Get or create cart
    let cart = await this.prisma.cart.findFirst({
      where: { tenantId, userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { tenantId, userId },
      });
    }

    // Check if item already exists in cart
    const existingItem = await this.prisma.cartItem.findUnique({
      where: { cartId_variantId: { cartId: cart.id, variantId } },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      // Check stock for updated quantity
      if (variant.inventory && variant.inventory.availableStock < newQuantity) {
        throw new BadRequestException(
          `Stock insuficiente. Disponible: ${variant.inventory.availableStock}, en carrito: ${existingItem.quantity}, solicitado: ${quantity}`,
        );
      }

      // Update quantity
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity, unitPriceSnapshot: Number(variant.prices[0].price) },
      });
    } else {
      // Add new item
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId,
          quantity,
          unitPriceSnapshot: Number(variant.prices[0].price),
        },
      });
    }

    // Return updated cart
    return this.getOrCreateCart(tenantId, userId);
  }

  /**
   * Update the quantity of a cart item.
   */
  async updateItem(tenantId: bigint, userId: bigint, itemId: bigint, data: {
    quantity: number;
  }) {
    if (data.quantity < 1) {
      throw new BadRequestException('La cantidad debe ser al menos 1');
    }

    const cart = await this.prisma.cart.findFirst({
      where: { tenantId, userId },
    });

    if (!cart) {
      throw new NotFoundException('Carrito no encontrado');
    }

    const cartItem = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: {
        variant: {
          include: { inventory: true },
        },
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Ítem no encontrado en el carrito');
    }

    // Check stock
    if (cartItem.variant.inventory && cartItem.variant.inventory.availableStock < data.quantity) {
      throw new BadRequestException(
        `Stock insuficiente. Disponible: ${cartItem.variant.inventory.availableStock}`,
      );
    }

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: data.quantity },
    });

    return this.getOrCreateCart(tenantId, userId);
  }

  /**
   * Remove an item from the cart.
   */
  async removeItem(tenantId: bigint, userId: bigint, itemId: bigint) {
    const cart = await this.prisma.cart.findFirst({
      where: { tenantId, userId },
    });

    if (!cart) {
      throw new NotFoundException('Carrito no encontrado');
    }

    const cartItem = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!cartItem) {
      throw new NotFoundException('Ítem no encontrado en el carrito');
    }

    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    return this.getOrCreateCart(tenantId, userId);
  }

  /**
   * Clear all items from the cart.
   */
  async clearCart(tenantId: bigint, userId: bigint) {
    const cart = await this.prisma.cart.findFirst({
      where: { tenantId, userId },
    });

    if (!cart) {
      throw new NotFoundException('Carrito no encontrado');
    }

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return this.getOrCreateCart(tenantId, userId);
  }
}
