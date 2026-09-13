import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { TenantGuard } from '../common/guards/tenant.guard';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Storefront & Admin - Orders')
@Controller('api')
@UseGuards(TenantGuard, AuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('store/orders')
  @ApiOperation({ summary: 'Crear nuevo pedido en el tenant actual con reserva de stock' })
  async createOrder(
    @CurrentTenant() tenant: any,
    @CurrentUser() user: any,
    @Body() body: any,
  ) {
    return this.ordersService.createOrder(tenant.id, user.id, body);
  }

  @Get('store/orders')
  @ApiOperation({ summary: 'Listar pedidos del cliente actual' })
  async getUserOrders(@CurrentTenant() tenant: any, @CurrentUser() user: any) {
    return this.ordersService.getUserOrders(tenant.id, user.id);
  }

  @Get('admin/orders')
  @UseGuards(RolesGuard)
  @Roles('TENANT_ADMIN', 'TENANT_MANAGER')
  @ApiHeader({ name: 'x-tenant-slug', description: 'Slug del tenant', required: false })
  @ApiOperation({ summary: 'Listar todos los pedidos de la tienda para el admin' })
  async getAdminOrders(@CurrentTenant() tenant: any) {
    return this.ordersService.getAdminOrders(tenant.id);
  }

  @Get('admin/orders/:id')
  @UseGuards(RolesGuard)
  @Roles('TENANT_ADMIN', 'TENANT_MANAGER')
  @ApiHeader({ name: 'x-tenant-slug', description: 'Slug del tenant', required: false })
  @ApiOperation({ summary: 'Obtener detalle completo de un pedido para el admin' })
  async getAdminOrderById(
    @CurrentTenant() tenant: any,
    @Param('id') id: string,
  ) {
    return this.ordersService.getOrderById(tenant.id, BigInt(id));
  }

  @Patch('admin/orders/:id/status')
  @UseGuards(RolesGuard)
  @Roles('TENANT_ADMIN', 'TENANT_MANAGER')
  @ApiHeader({ name: 'x-tenant-slug', description: 'Slug del tenant', required: false })
  @ApiOperation({ summary: 'Cambiar estado de un pedido (con transiciones válidas)' })
  @ApiBearerAuth()
  async updateOrderStatus(
    @CurrentTenant() tenant: any,
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: {
      status: string;
      note?: string;
      courier?: string;
      trackingCode?: string;
    },
  ) {
    return this.ordersService.updateOrderStatus(tenant.id, BigInt(id), user.id, body);
  }
}
