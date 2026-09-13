import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { InventoryScheduler } from './inventory.scheduler';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, ScheduleModule.forRoot()],
  controllers: [InventoryController],
  providers: [InventoryService, InventoryScheduler],
  exports: [InventoryService],
})
export class InventoryModule {}
