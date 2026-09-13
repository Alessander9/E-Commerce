import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get or create the user's wishlist for the current tenant.
   */
  async getOrCreateWishlist(tenantId: bigint, userId: bigint) {
    let wishlist = await this.prisma.wishlist.findFirst({
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
                    description: true,
                  },
                },
                prices: { where: { isActive: true }, take: 1 },
                inventory: true,
              },
            },
          },
          orderBy: { addedAt: 'desc' },
        },
      },
    });

    if (!wishlist) {
      wishlist = await this.prisma.wishlist.create({
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
                      description: true,
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

    const items = wishlist.items.map((item) => ({
      id: item.id.toString(),
      variant: {
        id: item.variant.id.toString(),
        sku: item.variant.sku,
        name: item.variant.name,
        product: item.variant.product,
        price: item.variant.prices[0] ? Number(item.variant.prices[0].price) : 0,
        compareAtPrice: item.variant.prices[0]?.compareAtPrice
          ? Number(item.variant.prices[0].compareAtPrice)
          : null,
        inStock: item.variant.inventory
          ? item.variant.inventory.availableStock > 0
          : true,
        availableStock: item.variant.inventory?.availableStock || 0,
      },
      addedAt: item.addedAt,
    }));

    return {
      id: wishlist.id.toString(),
      items,
      summary: {
        totalItems: items.length,
      },
      createdAt: wishlist.createdAt,
      updatedAt: wishlist.updatedAt,
    };
  }

  /**
   * Add a product variant to the wishlist.
   */
  async addItem(tenantId: bigint, userId: bigint, data: { variantId: string }) {
    const variantId = BigInt(data.variantId);

    // Verify variant exists and belongs to tenant
    const variant = await this.prisma.productVariant.findFirst({
      where: {
        id: variantId,
        active: true,
        product: { tenantId, deletedAt: null, active: true },
      },
    });

    if (!variant) {
      throw new NotFoundException('Variante de producto no encontrada');
    }

    // Get or create wishlist
    let wishlist = await this.prisma.wishlist.findFirst({
      where: { tenantId, userId },
    });

    if (!wishlist) {
      wishlist = await this.prisma.wishlist.create({
        data: { tenantId, userId },
      });
    }

    // Check if already in wishlist
    const existing = await this.prisma.wishlistItem.findUnique({
      where: { wishlistId_variantId: { wishlistId: wishlist.id, variantId } },
    });

    if (existing) {
      throw new BadRequestException('Este producto ya está en tu lista de favoritos');
    }

    await this.prisma.wishlistItem.create({
      data: { wishlistId: wishlist.id, variantId },
    });

    return this.getOrCreateWishlist(tenantId, userId);
  }

  /**
   * Remove a product variant from the wishlist.
   */
  async removeItem(tenantId: bigint, userId: bigint, itemId: bigint) {
    const wishlist = await this.prisma.wishlist.findFirst({
      where: { tenantId, userId },
    });

    if (!wishlist) {
      throw new NotFoundException('Lista de favoritos no encontrada');
    }

    const item = await this.prisma.wishlistItem.findFirst({
      where: { id: itemId, wishlistId: wishlist.id },
    });

    if (!item) {
      throw new NotFoundException('Ítem no encontrado en la lista de favoritos');
    }

    await this.prisma.wishlistItem.delete({
      where: { id: itemId },
    });

    return this.getOrCreateWishlist(tenantId, userId);
  }

  /**
   * Remove a product variant from wishlist by variant ID.
   */
  async removeByVariantId(tenantId: bigint, userId: bigint, variantId: bigint) {
    const wishlist = await this.prisma.wishlist.findFirst({
      where: { tenantId, userId },
    });

    if (!wishlist) {
      throw new NotFoundException('Lista de favoritos no encontrada');
    }

    await this.prisma.wishlistItem.deleteMany({
      where: { wishlistId: wishlist.id, variantId },
    });

    return this.getOrCreateWishlist(tenantId, userId);
  }

  /**
   * Check if a variant is in the user's wishlist.
   */
  async checkInWishlist(tenantId: bigint, userId: bigint, variantId: bigint) {
    const wishlist = await this.prisma.wishlist.findFirst({
      where: { tenantId, userId },
    });

    if (!wishlist) {
      return { inWishlist: false };
    }

    const item = await this.prisma.wishlistItem.findUnique({
      where: { wishlistId_variantId: { wishlistId: wishlist.id, variantId } },
    });

    return { inWishlist: !!item, itemId: item?.id?.toString() || null };
  }
}
