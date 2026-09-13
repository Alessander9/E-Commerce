import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { TenantGuard } from '../common/guards/tenant.guard';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Storefront - Cart')
@Controller('api/store/cart')
@UseGuards(TenantGuard, AuthGuard)
@ApiBearerAuth()
@ApiHeader({ name: 'x-tenant-slug', description: 'Slug del tenant', required: false })
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener el carrito del usuario actual con items y totales' })
  async getCart(
    @CurrentTenant() tenant: any,
    @CurrentUser() user: any,
  ) {
    return this.cartService.getOrCreateCart(tenant.id, user.id);
  }

  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Agregar un item al carrito del usuario' })
  async addItem(
    @CurrentTenant() tenant: any,
    @CurrentUser() user: any,
    @Body() body: { variantId: string; quantity?: number },
  ) {
    return this.cartService.addItem(tenant.id, user.id, body);
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Actualizar la cantidad de un item en el carrito' })
  async updateItem(
    @CurrentTenant() tenant: any,
    @CurrentUser() user: any,
    @Param('itemId') itemId: string,
    @Body() body: { quantity: number },
  ) {
    return this.cartService.updateItem(tenant.id, user.id, BigInt(itemId), body);
  }

  @Delete('items/:itemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un item del carrito' })
  async removeItem(
    @CurrentTenant() tenant: any,
    @CurrentUser() user: any,
    @Param('itemId') itemId: string,
  ) {
    return this.cartService.removeItem(tenant.id, user.id, BigInt(itemId));
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vaciar todo el carrito del usuario' })
  async clearCart(
    @CurrentTenant() tenant: any,
    @CurrentUser() user: any,
  ) {
    return this.cartService.clearCart(tenant.id, user.id);
  }
}
