import { Module } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { StoreCatalogController } from './store-catalog.controller';
import { AdminCatalogController } from './admin-catalog.controller';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { StorageService } from './storage.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [
    StoreCatalogController,
    AdminCatalogController,
    CartController,
    WishlistController,
  ],
  providers: [CatalogService, CartService, WishlistService, StorageService],
  exports: [CatalogService, CartService, WishlistService, StorageService],
})
export class CatalogModule {}
