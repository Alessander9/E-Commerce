import { Module } from '@nestjs/common';
import { TenantsService } from './tenants/tenants.service';
import { TenantsController } from './tenants/tenants.controller';
import { TenantSettingsController } from './tenant-settings.controller';
import { PlatformService } from './platform.service';
import { PlatformController } from './platform.controller';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [
    TenantsController,
    TenantSettingsController,
    PlatformController,
    ReportsController,
  ],
  providers: [TenantsService, PlatformService, ReportsService],
  exports: [TenantsService, PlatformService, ReportsService],
})
export class PlatformModule {}
