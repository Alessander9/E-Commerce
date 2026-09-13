import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { TenantGuard } from '../common/guards/tenant.guard';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@ApiTags('Storefront - Catalog')
@Controller('api/store')
@UseGuards(TenantGuard)
@ApiHeader({ name: 'x-tenant-slug', description: 'Slug del tenant (ej. cleo)', required: false })
export class StoreCatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('products')
  @ApiOperation({ summary: 'Obtener productos activos del catálogo del tenant actual, con filtros avanzados' })
  async getProducts(
    @CurrentTenant() tenant: any,
    @Query('category') categorySlug?: string,
    @Query('featured') featured?: string,
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('minWeight') minWeight?: string,
    @Query('maxWeight') maxWeight?: string,
    @Query('weightUnit') weightUnit?: string,
    @Query('brand') brand?: string,
    @Query('inStock') inStock?: string,
    @Query('onSale') onSale?: string,
    @Query('sort') sort?: string,
  ) {
    return this.catalogService.getStoreProducts(tenant.id, {
      categorySlug,
      featured: featured ? featured === 'true' : undefined,
      search,
      minPrice: minPrice !== undefined && minPrice !== '' ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice !== undefined && maxPrice !== '' ? parseFloat(maxPrice) : undefined,
      minWeight: minWeight !== undefined && minWeight !== '' ? parseFloat(minWeight) : undefined,
      maxWeight: maxWeight !== undefined && maxWeight !== '' ? parseFloat(maxWeight) : undefined,
      weightUnit: weightUnit || undefined,
      brand,
      inStock: inStock ? inStock === 'true' : undefined,
      onSale: onSale ? onSale === 'true' : undefined,
      sort,
    });
  }

  @Get('products/:slug')
  @ApiOperation({ summary: 'Obtener detalle completo de un producto por slug en el tenant actual' })
  async getProductBySlug(@CurrentTenant() tenant: any, @Param('slug') slug: string) {
    return this.catalogService.getStoreProductBySlug(tenant.id, slug);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Obtener categorías activas del tenant actual' })
  async getCategories(@CurrentTenant() tenant: any) {
    return this.catalogService.getStoreCategories(tenant.id);
  }
}
