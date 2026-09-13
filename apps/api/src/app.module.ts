import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { PlatformModule } from './platform/platform.module';
import { CatalogModule } from './catalog/catalog.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { CouponsModule } from './coupons/coupons.module';
import { ShippingModule } from './shipping/shipping.module';
import { InventoryModule } from './inventory/inventory.module';
import { NotificationsModule } from './notifications/notifications.module';
import { BillingModule } from './billing/billing.module';
import { TenantContextMiddleware } from './common/middleware/tenant-context.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // ── Rate Limiting ──
    // Global: 100 requests per 60 seconds per IP.
    // Specific controllers can override with @Throttle({ default: { limit: N, ttl: M } })
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000, // 60 seconds
        limit: 100,
      },
    ]),

    DatabaseModule,
    AuthModule,
    PlatformModule,
    CatalogModule,
    OrdersModule,
    PaymentsModule,
    CouponsModule,
    ShippingModule,
    InventoryModule,
    NotificationsModule,
    BillingModule,
  ],
  providers: [
    // Global throttler guard applied to all routes
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply TenantContextMiddleware globally so every request gets an
    // AsyncLocalStorage context. The TenantGuard will populate tenantId.
    consumer.apply(TenantContextMiddleware).forRoutes('*');
  }
}
