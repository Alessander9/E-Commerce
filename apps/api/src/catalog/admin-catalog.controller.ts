import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { TenantGuard } from '../common/guards/tenant.guard';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@ApiTags('Tenant Admin - Catalog')
@Controller('api/admin')
@UseGuards(TenantGuard, AuthGuard, RolesGuard)
@Roles('TENANT_ADMIN', 'TENANT_MANAGER')
@ApiBearerAuth()
@ApiHeader({ name: 'x-tenant-slug', description: 'Slug del tenant', required: false })
export class AdminCatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  // ===================== PRODUCTS =====================

  @Get('products')
  @ApiOperation({ summary: 'Listar productos del catálogo para administración' })
  async getProducts(@CurrentTenant() tenant: any) {
    return this.catalogService.getAdminProducts(tenant.id);
  }

  @Post('products')
  @ApiOperation({ summary: 'Crear nuevo producto en el catálogo del tenant' })
  async createProduct(@CurrentTenant() tenant: any, @Body() body: any) {
    return this.catalogService.createAdminProduct(tenant.id, body);
  }

  @Put('products/:id')
  @ApiOperation({ summary: 'Actualizar un producto existente del catálogo' })
  async updateProduct(
    @CurrentTenant() tenant: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.catalogService.updateAdminProduct(tenant.id, BigInt(id), body);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Eliminar (soft delete) un producto del catálogo' })
  async deleteProduct(
    @CurrentTenant() tenant: any,
    @Param('id') id: string,
  ) {
    return this.catalogService.deleteAdminProduct(tenant.id, BigInt(id));
  }

  // ===================== CATEGORIES =====================

  @Get('categories')
  @ApiOperation({ summary: 'Listar categorías del tenant para administración' })
  async getCategories(@CurrentTenant() tenant: any) {
    return this.catalogService.getAdminCategories(tenant.id);
  }

  @Post('categories')
  @ApiOperation({ summary: 'Crear nueva categoría en el tenant' })
  async createCategory(@CurrentTenant() tenant: any, @Body() body: any) {
    return this.catalogService.createCategory(tenant.id, body);
  }

  @Put('categories/:id')
  @ApiOperation({ summary: 'Actualizar una categoría existente' })
  async updateCategory(
    @CurrentTenant() tenant: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.catalogService.updateCategory(tenant.id, BigInt(id), body);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Eliminar (soft delete) una categoría' })
  async deleteCategory(
    @CurrentTenant() tenant: any,
    @Param('id') id: string,
  ) {
    return this.catalogService.deleteCategory(tenant.id, BigInt(id));
  }

  @Patch('categories/reorder')
  @ApiOperation({ summary: 'Reordenar categorías del tenant' })
  async reorderCategories(
    @CurrentTenant() tenant: any,
    @Body() body: { categories: Array<{ id: string; displayOrder: number }> },
  ) {
    return this.catalogService.reorderCategories(tenant.id, body.categories);
  }

  // ===================== PRODUCT IMAGES =====================

  @Post('products/:id/images')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir imagen de producto (Supabase Storage o local)' })
  async uploadProductImage(
    @CurrentTenant() tenant: any,
    @Param('id') id: string,
    @UploadedFile() file: any,
  ) {
    return this.catalogService.uploadProductImage(tenant.id, tenant.slug, id, file);
  }

  @Delete('products/images/:imageId')
  @ApiOperation({ summary: 'Eliminar una imagen de producto' })
  async deleteProductImage(
    @CurrentTenant() tenant: any,
    @Param('imageId') imageId: string,
  ) {
    return this.catalogService.deleteProductImage(tenant.id, BigInt(imageId));
  }

  // ===================== OPTIONS & VARIANTS =====================

  @Get('options')
  @ApiOperation({ summary: 'Listar opciones de producto del tenant (Color, Talla, etc.)' })
  async getOptions(@CurrentTenant() tenant: any) {
    return this.catalogService.getProductOptions(tenant.id);
  }

  @Post('options')
  @ApiOperation({ summary: 'Crear nueva opción de producto con sus valores' })
  async createOption(
    @CurrentTenant() tenant: any,
    @Body() body: {
      name: string;
      displayType?: string;
      displayOrder?: number;
      values: Array<{ value: string; label: string; colorHex?: string; imageUrl?: string }>;
    },
  ) {
    return this.catalogService.createProductOption(tenant.id, body);
  }

  @Post('products/:id/generate-variants')
  @ApiOperation({ summary: 'Generar variantes automáticamente desde combinaciones de opciones (ej. Talla x Color)' })
  async generateVariants(
    @CurrentTenant() tenant: any,
    @Param('id') id: string,
    @Body() body: {
      optionIds: string[];
      defaultPrice: number;
      defaultStock: number;
      skuPrefix?: string;
    },
  ) {
    return this.catalogService.generateVariants(tenant.id, BigInt(id), body);
  }
}
