import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { ShippingService } from './shipping.service';
import { TenantGuard } from '../common/guards/tenant.guard';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@ApiTags('Shipping & Tracking')
@Controller('api')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  // ===================== STOREFRONT =====================

  @Get('store/shipping/zones')
  @UseGuards(TenantGuard)
  @ApiHeader({ name: 'x-tenant-slug', description: 'Slug del tenant', required: false })
  @ApiOperation({ summary: 'Obtener zonas y tarifas de envío configuradas para el tenant actual' })
  async getZones(@CurrentTenant() tenant: any) {
    return this.shippingService.getShippingZones(tenant.id);
  }

  // ===================== ADMIN — SHIPMENT MANAGEMENT =====================

  @Get('admin/shipments')
  @UseGuards(TenantGuard, AuthGuard, RolesGuard)
  @Roles('TENANT_ADMIN', 'TENANT_MANAGER')
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-tenant-slug', description: 'Slug del tenant', required: false })
  @ApiOperation({ summary: 'Listar envíos del tenant para administración' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filtrar por estado del envío' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Buscar por N° de pedido o tracking' })
  async getAdminShipments(
    @CurrentTenant() tenant: any,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.shippingService.getAdminShipments(tenant.id, { status, search });
  }

  @Get('admin/shipments/:id')
  @UseGuards(TenantGuard, AuthGuard, RolesGuard)
  @Roles('TENANT_ADMIN', 'TENANT_MANAGER')
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-tenant-slug', description: 'Slug del tenant', required: false })
  @ApiOperation({ summary: 'Obtener detalle completo de un envío con historial de tracking' })
  async getShipmentDetail(
    @CurrentTenant() tenant: any,
    @Param('id') id: string,
  ) {
    return this.shippingService.getShipmentDetail(tenant.id, BigInt(id));
  }

  @Patch('admin/shipments/:id/assign-courier')
  @UseGuards(TenantGuard, AuthGuard, RolesGuard)
  @Roles('TENANT_ADMIN', 'TENANT_MANAGER')
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-tenant-slug', description: 'Slug del tenant', required: false })
  @ApiOperation({ summary: 'Asignar courier y código de tracking a un envío' })
  async assignCourier(
    @CurrentTenant() tenant: any,
    @Param('id') id: string,
    @Body() body: {
      courier: string;
      deliveryService?: string;
      trackingCode: string;
    },
  ) {
    return this.shippingService.assignCourier(tenant.id, BigInt(id), body);
  }

  @Post('admin/shipments/:id/tracking')
  @UseGuards(TenantGuard, AuthGuard, RolesGuard)
  @Roles('TENANT_ADMIN', 'TENANT_MANAGER')
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-tenant-slug', description: 'Slug del tenant', required: false })
  @ApiOperation({ summary: 'Agregar evento de tracking al envío (EN_TRANSITO, EN_REPARTO, ENTREGADO)' })
  async addTrackingEvent(
    @CurrentTenant() tenant: any,
    @Param('id') id: string,
    @Body() body: {
      status: string;
      location?: string;
      description: string;
    },
  ) {
    return this.shippingService.addTrackingEvent(tenant.id, BigInt(id), body);
  }
}
