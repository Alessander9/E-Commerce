import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { TenantGuard } from '../common/guards/tenant.guard';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@ApiTags('Storefront & Admin - Coupons')
@Controller('api')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post('store/coupons/validate')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Validar un cupón de descuento para el carrito actual' })
  async validateCoupon(
    @CurrentTenant() tenant: any,
    @Body() body: { code: string; amount: number },
  ) {
    return this.couponsService.validateCoupon(tenant.id, body.code, body.amount);
  }

  @Get('admin/coupons')
  @UseGuards(TenantGuard, AuthGuard, RolesGuard)
  @Roles('TENANT_ADMIN', 'TENANT_MANAGER')
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-tenant-slug', description: 'Slug del tenant', required: false })
  @ApiOperation({ summary: 'Listar cupones de la tienda' })
  async getAdminCoupons(@CurrentTenant() tenant: any) {
    return this.couponsService.getAdminCoupons(tenant.id);
  }

  @Post('admin/coupons')
  @UseGuards(TenantGuard, AuthGuard, RolesGuard)
  @Roles('TENANT_ADMIN')
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-tenant-slug', description: 'Slug del tenant', required: false })
  @ApiOperation({ summary: 'Crear nuevo cupón de descuento para la tienda' })
  async createCoupon(@CurrentTenant() tenant: any, @Body() body: any) {
    return this.couponsService.createCoupon(tenant.id, body);
  }
}
