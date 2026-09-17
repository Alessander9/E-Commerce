import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { StorageService } from './storage.service';

@Injectable()
export class CatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  // ===================== STOREFRONT (PUBLIC) =====================
  async getStoreProducts(tenantId: bigint, query?: {
    categorySlug?: string;
    featured?: boolean;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    minWeight?: number;
    maxWeight?: number;
    weightUnit?: string;
    brand?: string;
    inStock?: boolean;
    onSale?: boolean;
    sort?: string;
  }) {
    const where: any = {
      tenantId,
      active: true,
      deletedAt: null,
    };

    if (query?.featured !== undefined) {
      where.featured = query.featured;
    }

    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { brand: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query?.categorySlug) {
      where.productCategories = {
        some: {
          category: {
            slug: query.categorySlug,
            active: true,
          },
        },
      };
    }

    if (query?.brand) {
      where.brand = { contains: query.brand, mode: 'insensitive' };
    }

    // ---- Variant-level filters (price / weight / stock / sale) ----
    const variantWhere: any = { active: true };

    const priceFilter: any = {};
    if (query?.minPrice !== undefined && !isNaN(query.minPrice)) {
      priceFilter.gte = query.minPrice;
    }
    if (query?.maxPrice !== undefined && !isNaN(query.maxPrice)) {
      priceFilter.lte = query.maxPrice;
    }
    if (Object.keys(priceFilter).length > 0) {
      variantWhere.prices = { some: { price: priceFilter, isActive: true } };
    }

    // Size (weight) filter. Variants store weight in kilograms by convention;
    // if the storefront sends grams, convert before querying.
    const toKg = (v: number) => (query?.weightUnit === 'g' ? v / 1000 : v);
    const weightFilter: any = {};
    if (query?.minWeight !== undefined && !isNaN(query.minWeight)) {
      weightFilter.gte = toKg(query.minWeight);
    }
    if (query?.maxWeight !== undefined && !isNaN(query.maxWeight)) {
      weightFilter.lte = toKg(query.maxWeight);
    }
    if (Object.keys(weightFilter).length > 0) {
      variantWhere.weight = weightFilter;
    }

    if (query?.inStock === true) {
      variantWhere.inventory = { availableStock: { gt: 0 } };
    }

    // "On sale" (compareAtPrice > price) is validated in memory after the query,
    // since comparing two columns isn't reliably expressible in the Prisma where.
    const needsSalePostFilter = query?.onSale === true;

    const rawProducts = await this.prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        productCategories: {
          include: { category: true },
        },
        variants: {
          where: variantWhere,
          include: {
            prices: { where: { isActive: true } },
            inventory: true,
            variantValues: {
              include: { optionValue: true },
            },
          },
        },
      },
      orderBy: this.getStoreSortOrderBy(query?.sort),
    });

    // Keep only products that actually have matching variants after inclusion
    let products = rawProducts.filter((p: any) => p.variants.length > 0);

    if (needsSalePostFilter) {
      products = products
        .map((p: any) => ({
          ...p,
          variants: p.variants.filter((v: any) =>
            v.prices.some((pr: any) => {
              const price = Number(pr.price);
              const compare = pr.compareAtPrice != null ? Number(pr.compareAtPrice) : null;
              return compare != null && compare > price;
            }),
          ),
        }))
        .filter((p: any) => p.variants.length > 0);
    }

    if (query?.sort === 'price-asc' || query?.sort === 'price-desc') {
      const dir = query.sort === 'price-asc' ? 1 : -1;
      products = [...products].sort((a: any, b: any) => {
        const minPriceOf = (p: any) =>
          Math.min(
            ...p.variants.flatMap((v: any) =>
              v.prices.map((pr: any) => Number(pr.price)),
            ).concat([Infinity]),
          );
        return (minPriceOf(a) - minPriceOf(b)) * dir;
      });
    }

    return products;
  }

  private getStoreSortOrderBy(sort?: string): Prisma.ProductOrderByWithRelationInput {
    switch (sort) {
      case 'name-asc':
        return { name: 'asc' };
      case 'name-desc':
        return { name: 'desc' };
      case 'oldest':
        return { createdAt: 'asc' };
      case 'price-asc':
      case 'price-desc':
        // Sorted in memory after the query (min variant price); order here is irrelevant.
        return { createdAt: 'desc' };
      case 'newest':
      default:
        return { createdAt: 'desc' };
    }
  }

  async getStoreProductBySlug(tenantId: bigint, slug: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        tenantId,
        slug,
        active: true,
        deletedAt: null,
      },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        productCategories: {
          include: { category: true },
        },
        variants: {
          where: { active: true },
          include: {
            prices: { where: { isActive: true } },
            inventory: true,
            variantValues: {
              include: { optionValue: true },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Producto con slug '${slug}' no encontrado en esta tienda.`);
    }

    return product;
  }

  async getStoreCategories(tenantId: bigint) {
    return this.prisma.category.findMany({
      where: {
        tenantId,
        active: true,
        deletedAt: null,
      },
      include: {
        _count: { select: { productCategories: true } },
        children: { where: { active: true } },
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  // ===================== TENANT ADMIN — PRODUCTS =====================
  async getAdminProducts(tenantId: bigint) {
    return this.prisma.product.findMany({
      where: { tenantId, deletedAt: null },
      include: {
        images: true,
        productCategories: { include: { category: true } },
        variants: {
          include: {
            prices: true,
            inventory: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createAdminProduct(tenantId: bigint, data: {
    name: string;
    slug: string;
    baseSku?: string;
    description?: string;
    brand?: string;
    categoryId?: string;
    imageUrl?: string;
    price: number;
    compareAtPrice?: number;
    stock: number;
  }) {
    // Check slug uniqueness within tenant
    const existing = await this.prisma.product.findFirst({
      where: { tenantId, slug: data.slug.toLowerCase(), deletedAt: null },
    });
    if (existing) {
      throw new BadRequestException(`Ya existe un producto con el slug '${data.slug}' en esta tienda`);
    }

    const product = await this.prisma.product.create({
      data: {
        tenantId,
        name: data.name,
        slug: data.slug.toLowerCase(),
        baseSku: data.baseSku,
        description: data.description,
        brand: data.brand,
        active: true,
        hasVariants: true,
        productCategories: data.categoryId
          ? {
              create: { categoryId: BigInt(data.categoryId) },
            }
          : undefined,
        images: data.imageUrl
          ? {
              create: { url: data.imageUrl, isPrimary: true },
            }
          : undefined,
        variants: {
          create: {
            sku: data.baseSku || `${data.slug.toUpperCase()}-DEF`,
            name: 'Estándar',
            active: true,
            prices: {
              create: {
                price: data.price,
                compareAtPrice: data.compareAtPrice,
                currency: 'PEN',
                isActive: true,
              },
            },
            inventory: {
              create: {
                availableStock: data.stock || 0,
                reservedStock: 0,
                minimumStock: 5,
              },
            },
          },
        },
      },
      include: {
        variants: { include: { prices: true, inventory: true } },
        images: true,
      },
    });

    return product;
  }

  async updateAdminProduct(tenantId: bigint, productId: bigint, data: {
    name?: string;
    slug?: string;
    description?: string;
    brand?: string;
    baseSku?: string;
    active?: boolean;
    featured?: boolean;
    categoryId?: string;
    price?: number;
    stock?: number;
    imageUrl?: string;
  }) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, tenantId, deletedAt: null },
      include: {
        variants: {
          include: {
            prices: true,
            inventory: true,
          },
        },
        images: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado en esta tienda');
    }

    // Check slug uniqueness if changed
    if (data.slug && data.slug !== product.slug) {
      const existing = await this.prisma.product.findFirst({
        where: { tenantId, slug: data.slug.toLowerCase(), deletedAt: null, id: { not: productId } },
      });
      if (existing) {
        throw new BadRequestException(`Ya existe un producto con el slug '${data.slug}'`);
      }
    }

    // Handle category reassignment
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug.toLowerCase();
    if (data.description !== undefined) updateData.description = data.description;
    if (data.brand !== undefined) updateData.brand = data.brand;
    if (data.baseSku !== undefined) updateData.baseSku = data.baseSku;
    if (data.active !== undefined) updateData.active = data.active;
    if (data.featured !== undefined) updateData.featured = data.featured;

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        variants: { include: { prices: true, inventory: true } },
        images: true,
        productCategories: { include: { category: true } },
      },
    });

    // Update default variant price if provided
    if (data.price !== undefined && updated.variants && updated.variants.length > 0) {
      const defaultVar = updated.variants[0];
      const activePrice = defaultVar.prices?.find((p: any) => p.isActive) || defaultVar.prices?.[0];
      if (activePrice) {
        await this.prisma.productPrice.update({
          where: { id: activePrice.id },
          data: { price: Number(data.price) },
        });
      }
    }

    // Update default variant stock if provided
    if (data.stock !== undefined && updated.variants && updated.variants.length > 0) {
      const defaultVar = updated.variants[0];
      if (defaultVar.inventory) {
        await this.prisma.inventory.update({
          where: { id: defaultVar.inventory.id },
          data: { availableStock: Number(data.stock) },
        });
      }
    }

    // Update default variant SKU if baseSku provided
    if (data.baseSku !== undefined && updated.variants && updated.variants.length > 0) {
      const defaultVar = updated.variants[0];
      await this.prisma.productVariant.update({
        where: { id: defaultVar.id },
        data: { sku: data.baseSku },
      });
    }

    // Update primary image if provided
    if (data.imageUrl !== undefined && data.imageUrl.trim() !== '') {
      const primaryImg = updated.images?.find((img: any) => img.isPrimary) || updated.images?.[0];
      if (primaryImg) {
        await this.prisma.productImage.update({
          where: { id: primaryImg.id },
          data: { url: data.imageUrl },
        });
      } else {
        await this.prisma.productImage.create({
          data: {
            productId,
            url: data.imageUrl,
            isPrimary: true,
            displayOrder: 0,
          },
        });
      }
    }

    // Update category assignment if provided
    if (data.categoryId !== undefined) {
      // Remove existing category links
      await this.prisma.productCategory.deleteMany({
        where: { productId },
      });

      // Add new category link
      if (data.categoryId) {
        await this.prisma.productCategory.create({
          data: {
            productId,
            categoryId: BigInt(data.categoryId),
          },
        });
      }
    }

    // Return fresh product with all relations
    return this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: { include: { prices: true, inventory: true } },
        images: true,
        productCategories: { include: { category: true } },
      },
    });
  }

  async deleteAdminProduct(tenantId: bigint, productId: bigint) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, tenantId, deletedAt: null },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado en esta tienda');
    }

    // Soft delete
    return this.prisma.product.update({
      where: { id: productId },
      data: { deletedAt: new Date(), active: false },
    });
  }

  // ===================== TENANT ADMIN — CATEGORIES =====================
  async getAdminCategories(tenantId: bigint) {
    return this.prisma.category.findMany({
      where: { tenantId, deletedAt: null },
      include: {
        _count: { select: { productCategories: true, children: true } },
        parent: { select: { id: true, name: true, slug: true } },
        children: {
          where: { deletedAt: null },
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async createCategory(tenantId: bigint, data: {
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    parentId?: string;
    displayOrder?: number;
  }) {
    // Check slug uniqueness within tenant
    const existing = await this.prisma.category.findFirst({
      where: { tenantId, slug: data.slug.toLowerCase(), deletedAt: null },
    });
    if (existing) {
      throw new BadRequestException(`Ya existe una categoría con el slug '${data.slug}'`);
    }

    // Validate parent exists if provided
    if (data.parentId) {
      const parent = await this.prisma.category.findFirst({
        where: { id: BigInt(data.parentId), tenantId, deletedAt: null },
      });
      if (!parent) {
        throw new NotFoundException('Categoría padre no encontrada');
      }
    }

    return this.prisma.category.create({
      data: {
        tenantId,
        name: data.name,
        slug: data.slug.toLowerCase(),
        description: data.description,
        imageUrl: data.imageUrl,
        parentId: data.parentId ? BigInt(data.parentId) : null,
        displayOrder: data.displayOrder || 0,
        active: true,
      },
      include: {
        parent: { select: { id: true, name: true } },
        _count: { select: { productCategories: true, children: true } },
      },
    });
  }

  async updateCategory(tenantId: bigint, categoryId: bigint, data: {
    name?: string;
    slug?: string;
    description?: string;
    imageUrl?: string;
    active?: boolean;
    displayOrder?: number;
    parentId?: string | null;
  }) {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, tenantId, deletedAt: null },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // Check slug uniqueness if changed
    if (data.slug && data.slug !== category.slug) {
      const existing = await this.prisma.category.findFirst({
        where: { tenantId, slug: data.slug.toLowerCase(), deletedAt: null, id: { not: categoryId } },
      });
      if (existing) {
        throw new BadRequestException(`Ya existe una categoría con el slug '${data.slug}'`);
      }
    }

    // Prevent setting self as parent
    if (data.parentId && BigInt(data.parentId) === categoryId) {
      throw new BadRequestException('Una categoría no puede ser su propia padre');
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug.toLowerCase();
    if (data.description !== undefined) updateData.description = data.description;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.active !== undefined) updateData.active = data.active;
    if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;
    if (data.parentId !== undefined) {
      updateData.parentId = data.parentId ? BigInt(data.parentId) : null;
    }

    return this.prisma.category.update({
      where: { id: categoryId },
      data: updateData,
      include: {
        parent: { select: { id: true, name: true } },
        _count: { select: { productCategories: true, children: true } },
      },
    });
  }

  async deleteCategory(tenantId: bigint, categoryId: bigint) {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, tenantId, deletedAt: null },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // Check if category has products
    const productCount = await this.prisma.productCategory.count({
      where: { categoryId },
    });

    if (productCount > 0) {
      throw new BadRequestException(
        `No se puede eliminar: la categoría tiene ${productCount} producto(s) asociado(s). Desasócialos primero.`,
      );
    }

    // Check if category has children
    const childrenCount = await this.prisma.category.count({
      where: { parentId: categoryId, deletedAt: null },
    });

    if (childrenCount > 0) {
      throw new BadRequestException(
        `No se puede eliminar: la categoría tiene ${childrenCount} subcategoría(s). Elimínalas primero.`,
      );
    }

    // Soft delete
    return this.prisma.category.update({
      where: { id: categoryId },
      data: { deletedAt: new Date(), active: false },
    });
  }

  async reorderCategories(tenantId: bigint, categoryOrders: Array<{ id: string; displayOrder: number }>) {
    const updates = categoryOrders.map((item) =>
      this.prisma.category.updateMany({
        where: { id: BigInt(item.id), tenantId },
        data: { displayOrder: item.displayOrder },
      }),
    );

    await this.prisma.$transaction(updates);

    return { message: 'Orden de categorías actualizado' };
  }

  // ===================== VARIANT CREATOR =====================

  /**
   * Create options for a tenant (e.g., Color, Talla, Capacidad).
   */
  async createProductOption(tenantId: bigint, data: {
    name: string;
    displayType?: string;
    displayOrder?: number;
    values: Array<{ value: string; label: string; colorHex?: string; imageUrl?: string }>
  }) {
    // Check uniqueness
    const existing = await (this.prisma as any).productOption.findFirst({
      where: { tenantId, name: data.name },
    });
    if (existing) {
      throw new BadRequestException(`Ya existe una opción con el nombre '${data.name}'`);
    }

    return (this.prisma as any).productOption.create({
      data: {
        tenantId,
        name: data.name,
        displayType: data.displayType || 'BUTTON',
        displayOrder: data.displayOrder || 0,
        active: true,
        values: {
          create: data.values.map((v, i) => ({
            value: v.value.toLowerCase(),
            label: v.label,
            colorHex: v.colorHex,
            imageUrl: v.imageUrl,
            displayOrder: i,
          })),
        },
      },
      include: { values: true },
    });
  }

  /**
   * Get all product options for a tenant.
   */
  async getProductOptions(tenantId: bigint) {
    return (this.prisma as any).productOption.findMany({
      where: { tenantId, active: true },
      include: { values: { orderBy: { displayOrder: 'asc' } } },
      orderBy: { displayOrder: 'asc' },
    });
  }

  /**
   * Generate variants from option combinations.
   *
   * Example: Product "Camiseta" with options:
   *   - Color: [Rojo, Azul]
   *   - Talla: [S, M, L]
   *
   * Generates 6 variants:
   *   - Camiseta Rojo S
   *   - Camiseta Rojo M
   *   - Camiseta Rojo L
   *   - Camiseta Azul S
   *   - Camiseta Azul M
   *   - Camiseta Azul L
   *
   * Each variant gets:
   *   - Auto-generated SKU
   *   - Default price
   *   - Inventory record
   *   - Linked option values
   */
  async generateVariants(tenantId: bigint, productId: bigint, data: {
    optionIds: string[];
    defaultPrice: number;
    defaultStock: number;
    skuPrefix?: string;
  }) {
    const product = await (this.prisma as any).product.findFirst({
      where: { id: productId, tenantId, deletedAt: null },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Fetch options with their values
    const options = await Promise.all(
      data.optionIds.map((id) =>
        (this.prisma as any).productOption.findUnique({
          where: { id: BigInt(id) },
          include: { values: true },
        })
      )
    );

    // Validate all options exist
    const validOptions = options.filter(Boolean);
    if (validOptions.length !== data.optionIds.length) {
      throw new BadRequestException('Una o más opciones no fueron encontradas');
    }

    // Generate Cartesian product of all option values
    const combinations = this.cartesianProduct(
      validOptions.map((opt: any) =>
        opt.values.map((v: any) => ({ optionId: opt.id, optionValueId: v.id, value: v.value, label: v.label }))
      )
    );

    if (combinations.length === 0) {
      throw new BadRequestException('No se pudieron generar combinaciones. Verifica que las opciones tengan valores.');
    }

    const prefix = data.skuPrefix || product.name.substring(0, 3).toUpperCase();

    // Create all variants in a transaction
    const createdVariants = await (this.prisma as any).$transaction(
      combinations.map((combo: any[], index: number) => {
        // Build variant name: "Camiseta Rojo S"
        const variantName = `${product.name} ${combo.map((c) => c.label).join(' ')}`;
        const sku = `${prefix}-${combo.map((c) => c.value.substring(0, 3).toUpperCase()).join('')}-${String(index + 1).padStart(3, '0')}`;

        return (this.prisma as any).productVariant.create({
          data: {
            productId,
            sku,
            name: variantName,
            active: true,
            prices: {
              create: {
                price: data.defaultPrice,
                currency: 'PEN',
                isActive: true,
              },
            },
            inventory: {
              create: {
                availableStock: data.defaultStock,
                reservedStock: 0,
                minimumStock: 5,
              },
            },
            variantValues: {
              create: combo.map((c) => ({
                optionValueId: c.optionValueId,
              })),
            },
          },
          include: {
            prices: true,
            inventory: true,
            variantValues: {
              include: { optionValue: { include: { option: true } } },
            },
          },
        });
      })
    );

    // Update product to mark it as having variants
    await (this.prisma as any).product.update({
      where: { id: productId },
      data: { hasVariants: true },
    });

    // Link options to product
    for (const optionId of data.optionIds) {
      await (this.prisma as any).productVariantOption.upsert({
        where: {
          productId_optionId: { productId, optionId: BigInt(optionId) },
        },
        update: {},
        create: { productId, optionId: BigInt(optionId) },
      });
    }

    return {
      product: { id: productId.toString(), name: product.name },
      options: validOptions.map((o: any) => ({ id: o.id.toString(), name: o.name })),
      generatedVariants: createdVariants.length,
      variants: createdVariants.map((v: any) => ({
        id: v.id.toString(),
        sku: v.sku,
        name: v.name,
        price: Number(v.prices[0]?.price || data.defaultPrice),
        stock: v.inventory?.availableStock || 0,
        optionValues: v.variantValues.map((vv: any) => ({
          option: vv.optionValue?.option?.name,
          value: vv.optionValue?.label,
        })),
      })),
    };
  }

  /**
   * Calculate Cartesian product of arrays.
   */
  private cartesianProduct(arrays: any[][]): any[][] {
    return arrays.reduce(
      (acc, curr) => acc.flatMap((a) => curr.map((c) => [...a, c])),
      [[]] as any[][],
    );
  }

  // ===================== PRODUCT IMAGES =====================

  /**
   * Upload a product image to storage and create the image record.
   */
  async uploadProductImage(
    tenantId: bigint,
    tenantSlug: string,
    productId: string,
    file: any,
  ) {
    const pid = BigInt(productId);

    const product = await (this.prisma as any).product.findFirst({
      where: { id: pid, tenantId, deletedAt: null },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Upload to storage
    const uploadResult = await this.storageService.uploadProductImage(
      file,
      tenantSlug,
      productId,
    );

    // Count existing images to determine display order
    const imageCount = await (this.prisma as any).productImage.count({
      where: { productId: pid },
    });

    // Create image record
    const image = await (this.prisma as any).productImage.create({
      data: {
        productId: pid,
        url: uploadResult.url,
        altText: file.originalname,
        displayOrder: imageCount,
        isPrimary: imageCount === 0, // First image is primary
      },
    });

    return {
      id: image.id.toString(),
      url: uploadResult.url,
      altText: image.altText,
      displayOrder: image.displayOrder,
      isPrimary: image.isPrimary,
      size: uploadResult.size,
      mimetype: uploadResult.mimetype,
    };
  }

  /**
   * Delete a product image.
   */
  async deleteProductImage(tenantId: bigint, imageId: bigint) {
    const image = await (this.prisma as any).productImage.findFirst({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException('Imagen no encontrada');
    }

    // Verify product belongs to tenant
    const product = await (this.prisma as any).product.findFirst({
      where: { id: image.productId, tenantId },
    });

    if (!product) {
      throw new NotFoundException('Imagen no encontrada en esta tienda');
    }

    // Delete from storage
    // Extract path from URL
    const urlParts = image.url.split('/uploads/products/');
    if (urlParts.length > 1) {
      await this.storageService.deleteProductImage(urlParts[1]);
    }

    // Delete record
    await (this.prisma as any).productImage.delete({
      where: { id: imageId },
    });

    return { message: 'Imagen eliminada correctamente' };
  }
}
