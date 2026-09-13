import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { TenantGuard } from '../common/guards/tenant.guard';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Storefront - Wishlist')
@Controller('api/store/wishlist')
@UseGuards(TenantGuard, AuthGuard)
@ApiBearerAuth()
@ApiHeader({ name: 'x-tenant-slug', description: 'Slug del tenant', required: false })
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener la lista de favoritos del usuario' })
  async getWishlist(
    @CurrentTenant() tenant: any,
    @CurrentUser() user: any,
  ) {
    return this.wishlistService.getOrCreateWishlist(tenant.id, user.id);
  }

  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Agregar un producto a la lista de favoritos' })
  async addItem(
    @CurrentTenant() tenant: any,
    @CurrentUser() user: any,
    @Body() body: { variantId: string },
  ) {
    return this.wishlistService.addItem(tenant.id, user.id, body);
  }

  @Delete('items/:itemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un producto de la lista de favoritos' })
  async removeItem(
    @CurrentTenant() tenant: any,
    @CurrentUser() user: any,
    @Param('itemId') itemId: string,
  ) {
    return this.wishlistService.removeItem(tenant.id, user.id, BigInt(itemId));
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vaciar la lista de favoritos' })
  async clearWishlist(
    @CurrentTenant() tenant: any,
    @CurrentUser() user: any,
  ) {
    // Clear all items
    const wishlist = await this.wishlistService.getOrCreateWishlist(tenant.id, user.id);
    for (const item of wishlist.items) {
      await this.wishlistService.removeItem(tenant.id, user.id, BigInt(item.id));
    }
    return this.wishlistService.getOrCreateWishlist(tenant.id, user.id);
  }

  @Get('check/:variantId')
  @ApiOperation({ summary: 'Verificar si un producto está en la lista de favoritos' })
  async checkInWishlist(
    @CurrentTenant() tenant: any,
    @CurrentUser() user: any,
    @Param('variantId') variantId: string,
  ) {
    return this.wishlistService.checkInWishlist(tenant.id, user.id, BigInt(variantId));
  }
}
