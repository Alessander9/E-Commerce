import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { TenantGuard } from '../../common/guards/tenant.guard';

@ApiTags('Platform Super Admin - Tenants')
@Controller('api/platform/tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get('public/resolve/:slug')
  @ApiOperation({ summary: 'Resolver datos públicos del tenant para el storefront' })
  async resolveBySlug(@Param('slug') slug: string) {
    return this.tenantsService.findBySlug(slug);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('TENANT_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos los tenants registrados en Cleo Platform' })
  async findAll() {
    return this.tenantsService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('TENANT_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener detalle de un tenant por ID' })
  async findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(BigInt(id));
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('TENANT_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo tenant en Cleo Platform' })
  async create(@Body() body: any) {
    return this.tenantsService.create(body);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('TENANT_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar configuración visual y estado de un tenant' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.tenantsService.update(BigInt(id), body);
  }

  // ===================== TENANT LIFECYCLE =====================

  @Patch(':id/suspend')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('TENANT_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Suspender un tenant (inhabilita storefront y admin)' })
  async suspendTenant(@Param('id') id: string) {
    return this.tenantsService.suspendTenant(BigInt(id));
  }

  @Patch(':id/reactivate')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('TENANT_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reactivar un tenant suspendido' })
  async reactivateTenant(@Param('id') id: string) {
    return this.tenantsService.reactivateTenant(BigInt(id));
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('TENANT_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar (soft delete) un tenant' })
  async deleteTenant(@Param('id') id: string) {
    return this.tenantsService.deleteTenant(BigInt(id));
  }

  // ===================== USER-TENANT ASSIGNMENT =====================

  @Post('users/assign')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('TENANT_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Asignar un usuario a un tenant con un rol específico' })
  async assignUserToTenant(@Body() body: { userId: string; tenantId: string; roleId: string }) {
    return this.tenantsService.assignUserToTenant(body);
  }

  @Delete(':tenantId/users/:userId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('TENANT_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover un usuario de un tenant' })
  async removeUserFromTenant(
    @Param('tenantId') tenantId: string,
    @Param('userId') userId: string,
  ) {
    return this.tenantsService.removeUserFromTenant(BigInt(userId), BigInt(tenantId));
  }

  @Get('roles/all')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('TENANT_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener todos los roles disponibles en el sistema' })
  async getRoles() {
    return this.tenantsService.getRoles();
  }
}
