import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { TenantGuard } from '../common/guards/tenant.guard';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Tenant Admin - Inventory')
@Controller('api/admin/inventory')
@UseGuards(TenantGuard, AuthGuard, RolesGuard)
@Roles('TENANT_ADMIN', 'TENANT_MANAGER')
@ApiBearerAuth()
@ApiHeader({ name: 'x-tenant-slug', description: 'Slug del tenant', required: false })
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener overview de inventario con niveles de stock' })
  @ApiQuery({ name: 'lowStock', required: false, type: Boolean, description: 'Filtrar solo items con stock bajo' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Buscar por nombre, SKU o variante' })
  async getOverview(
    @CurrentTenant() tenant: any,
    @Query('lowStock') lowStock?: string,
    @Query('search') search?: string,
  ) {
    return this.inventoryService.getInventoryOverview(tenant.id, {
      lowStock: lowStock === 'true',
      search,
    });
  }

  @Get('movements')
  @ApiOperation({ summary: 'Obtener historial de movimientos de inventario' })
  @ApiQuery({ name: 'variantId', required: false, type: String, description: 'Filtrar por variante' })
  @ApiQuery({ name: 'movementType', required: false, type: String, description: 'Filtrar por tipo: PURCHASE, RETURN, ADJUSTMENT, MERMAS' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número máximo de resultados (default: 50)' })
  async getMovements(
    @CurrentTenant() tenant: any,
    @Query('variantId') variantId?: string,
    @Query('movementType') movementType?: string,
    @Query('limit') limit?: string,
  ) {
    return this.inventoryService.getMovements(tenant.id, {
      variantId,
      movementType,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Post('movements')
  @ApiOperation({ summary: 'Registrar un movimiento manual de inventario (compra, devolución, ajuste, merma)' })
  async registerMovement(
    @CurrentTenant() tenant: any,
    @CurrentUser() user: any,
    @Body() body: {
      variantId: string;
      movementType: 'PURCHASE' | 'RETURN' | 'ADJUSTMENT' | 'MERMAS';
      quantity: number;
      note?: string;
    },
  ) {
    return this.inventoryService.registerMovement(tenant.id, user.id, body);
  }

  @Patch('variants/:variantId/minimum-stock')
  @ApiOperation({ summary: 'Actualizar el stock mínimo de una variante' })
  async updateMinimumStock(
    @CurrentTenant() tenant: any,
    @Param('variantId') variantId: string,
    @Body() body: { minimumStock: number },
  ) {
    return this.inventoryService.updateMinimumStock(tenant.id, BigInt(variantId), body.minimumStock);
  }
}
