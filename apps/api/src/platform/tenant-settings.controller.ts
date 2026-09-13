import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { TenantsService } from './tenants/tenants.service';
import { TenantGuard } from '../common/guards/tenant.guard';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@ApiTags('Tenant Admin - Settings')
@Controller('api/admin/settings')
@UseGuards(TenantGuard, AuthGuard, RolesGuard)
@Roles('TENANT_ADMIN')
@ApiBearerAuth()
@ApiHeader({ name: 'x-tenant-slug', description: 'Slug del tenant', required: false })
export class TenantSettingsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener configuración del tenant (moneda, horarios, contacto, redes)' })
  async getSettings(@CurrentTenant() tenant: any) {
    return this.tenantsService.getTenantSettings(tenant.id);
  }

  @Patch()
  @ApiOperation({ summary: 'Actualizar configuración del tenant' })
  async updateSettings(
    @CurrentTenant() tenant: any,
    @Body() body: {
      currency?: string;
      timezone?: string;
      locale?: string;
      supportEmail?: string;
      supportPhone?: string;
      address?: string;
      businessHours?: any;
      settings?: any;
    },
  ) {
    return this.tenantsService.updateTenantSettings(tenant.id, body);
  }
}
