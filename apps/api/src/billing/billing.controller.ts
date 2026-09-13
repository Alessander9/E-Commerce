import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { TenantGuard } from '../common/guards/tenant.guard';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@ApiTags('Billing & Subscriptions')
@Controller('api')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // ===================== PLANS (Platform Admin) =====================

  @Get('platform/plans')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('TENANT_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos los planes disponibles (Admin)' })
  async getPlans() {
    return this.billingService.getPlans();
  }

  @Post('platform/plans')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('TENANT_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo plan de suscripción (Admin)' })
  async createPlan(@Body() body: any) {
    return this.billingService.createPlan(body);
  }

  @Patch('platform/plans/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('TENANT_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un plan existente (Admin)' })
  async updatePlan(@Param('id') id: string, @Body() body: any) {
    return this.billingService.updatePlan(Number(id), body);
  }

  // ===================== SUBSCRIPTIONS =====================

  @Get('admin/subscription')
  @UseGuards(TenantGuard, AuthGuard, RolesGuard)
  @Roles('TENANT_ADMIN')
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-tenant-slug', description: 'Slug del tenant', required: false })
  @ApiOperation({ summary: 'Obtener la suscripción actual del tenant con uso y límites' })
  async getTenantSubscription(@CurrentTenant() tenant: any) {
    return this.billingService.getTenantSubscription(tenant.id);
  }

  @Post('admin/subscription')
  @UseGuards(TenantGuard, AuthGuard, RolesGuard)
  @Roles('TENANT_ADMIN')
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-tenant-slug', description: 'Slug del tenant', required: false })
  @ApiOperation({ summary: 'Asignar o cambiar el plan de un tenant (Admin)' })
  async assignPlan(
    @CurrentTenant() tenant: any,
    @Body() body: { planId: number },
  ) {
    return this.billingService.assignPlan(tenant.id, body.planId);
  }

  @Patch('admin/subscription/cancel')
  @UseGuards(TenantGuard, AuthGuard, RolesGuard)
  @Roles('TENANT_ADMIN')
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-tenant-slug', description: 'Slug del tenant', required: false })
  @ApiOperation({ summary: 'Cancelar la suscripción de un tenant' })
  async cancelSubscription(@CurrentTenant() tenant: any) {
    return this.billingService.cancelSubscription(tenant.id);
  }

  @Get('admin/usage')
  @UseGuards(TenantGuard, AuthGuard, RolesGuard)
  @Roles('TENANT_ADMIN')
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-tenant-slug', description: 'Slug del tenant', required: false })
  @ApiOperation({ summary: 'Obtener uso actual del tenant (productos, pedidos, usuarios)' })
  async getUsage(@CurrentTenant() tenant: any) {
    return this.billingService.getTenantUsage(tenant.id);
  }

  @Get('admin/limits/:resource')
  @UseGuards(TenantGuard, AuthGuard, RolesGuard)
  @Roles('TENANT_ADMIN')
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-tenant-slug', description: 'Slug del tenant', required: false })
  @ApiOperation({ summary: 'Verificar límite de un recurso específico (products, orders, users)' })
  async checkLimit(
    @CurrentTenant() tenant: any,
    @Param('resource') resource: string,
  ) {
    return this.billingService.checkLimit(tenant.id, resource);
  }
}
