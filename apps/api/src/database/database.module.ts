import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TenantContext } from '../common/tenant-context';
import { RedisCacheService } from '../common/redis-cache.service';
import { JobQueueService } from '../common/job-queue.service';

@Global()
@Module({
  providers: [PrismaService, TenantContext, RedisCacheService, JobQueueService],
  exports: [PrismaService, TenantContext, RedisCacheService, JobQueueService],
})
export class DatabaseModule {}
