import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PlatformService } from './platform.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Platform Super Admin - Core Dashboard')
@Controller('api/platform')
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  @Get('dashboard/overview')
  @ApiOperation({ summary: 'Obtener métricas consolidadas del Dashboard Super Admin' })
  async getDashboardOverview() {
    return this.platformService.getDashboardOverview();
  }

  @Get('users')
  @ApiOperation({ summary: 'Listar usuarios globales de la plataforma con roles y tiendas' })
  async getAllUsers() {
    return this.platformService.getAllUsers();
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Activar o suspender un usuario global' })
  async toggleUserStatus(
    @Param('id') id: string,
    @Body('active') active: boolean,
  ) {
    return this.platformService.toggleUserStatus(BigInt(id), active);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Consultar logs de auditoría de la plataforma' })
  async getAuditLogs() {
    return this.platformService.getAuditLogs();
  }
}
