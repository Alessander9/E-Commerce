import {
  Controller,
  Get,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { TenantGuard } from '../common/guards/tenant.guard';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@ApiTags('Tenant Admin - Reports')
@Controller('api/admin/reports')
@UseGuards(TenantGuard, AuthGuard, RolesGuard)
@Roles('TENANT_ADMIN', 'TENANT_MANAGER')
@ApiBearerAuth()
@ApiHeader({ name: 'x-tenant-slug', description: 'Slug del tenant', required: false })
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales/csv')
  @ApiOperation({ summary: 'Exportar reporte de ventas a CSV' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String, description: 'Fecha inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'dateTo', required: false, type: String, description: 'Fecha fin (YYYY-MM-DD)' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filtrar por estado del pedido' })
  async exportSalesCsv(
    @CurrentTenant() tenant: any,
    @Res() res: Response,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('status') status?: string,
  ) {
    const result = await this.reportsService.generateSalesReport(tenant.id, {
      dateFrom,
      dateTo,
      status,
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    // Add BOM for Excel UTF-8 compatibility
    res.send('\uFEFF' + result.csv);
  }

  @Get('sales/trends')
  @ApiOperation({ summary: 'Obtener tendencias de ventas para gráficos (Recharts)' })
  @ApiQuery({ name: 'period', required: false, enum: ['daily', 'weekly', 'monthly'], description: 'Granularidad' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  async getSalesTrends(
    @CurrentTenant() tenant: any,
    @Query('period') period?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.reportsService.getSalesTrends(tenant.id, {
      period: (period as any) || 'weekly',
      dateFrom,
      dateTo,
    });
  }
}
