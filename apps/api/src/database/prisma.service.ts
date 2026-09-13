import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TenantContext } from '../common/tenant-context';

/**
 * Read actions where tenantId should be auto-injected into `where`.
 */
const FILTER_ACTIONS = new Set([
  'findMany',
  'findFirst',
  'count',
  'aggregate',
  'groupBy',
]);

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  /**
   * Tenant-scoped Prisma client. Use this instead of `this` (PrismaClient)
   * in services that should automatically filter by the current tenant.
   *
   * Example:
   *   // Before (manual filtering):
   *   await this.prisma.product.findMany({ where: { tenantId, active: true } });
   *
   *   // After (automatic filtering via TenantContext):
   *   await this.prisma.db.product.findMany({ where: { active: true } });
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public db!: any;

  constructor(private readonly tenantContext: TenantContext) {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.installTenantFilter();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Create an extended Prisma client that automatically injects `tenantId`
   * into where clauses for all tenant-scoped model read queries.
   *
   * For Platform Super Admin endpoints that need cross-tenant access,
   * call `tenantContext.setBypassFilter(true)` before making queries —
   * the middleware will skip the automatic injection.
   */
  private installTenantFilter(): void {
    const ctx = this.tenantContext;

    this.db = this.$extends({
      model: {
        $allModels: {
          async findMany({ args, query }: { args: any; query: (args: any) => Promise<any> }) {
            const tenantId = ctx.getTenantId();
            if (tenantId && args.where && !('tenantId' in args.where)) {
              args.where = { ...args.where, tenantId };
            }
            return query(args);
          },
          async findFirst({ args, query }: { args: any; query: (args: any) => Promise<any> }) {
            const tenantId = ctx.getTenantId();
            if (tenantId && args.where && !('tenantId' in args.where)) {
              args.where = { ...args.where, tenantId };
            }
            return query(args);
          },
          async count({ args, query }: { args: any; query: (args: any) => Promise<any> }) {
            const tenantId = ctx.getTenantId();
            if (tenantId && args.where && !('tenantId' in args.where)) {
              args.where = { ...args.where, tenantId };
            }
            return query(args);
          },
          async aggregate({ args, query }: { args: any; query: (args: any) => Promise<any> }) {
            const tenantId = ctx.getTenantId();
            if (tenantId && args.where && !('tenantId' in args.where)) {
              args.where = { ...args.where, tenantId };
            }
            return query(args);
          },
          async groupBy({ args, query }: { args: any; query: (args: any) => Promise<any> }) {
            const tenantId = ctx.getTenantId();
            if (tenantId && args.where && !('tenantId' in args.where)) {
              args.where = { ...args.where, tenantId };
            }
            return query(args);
          },
          async updateMany({ args, query }: { args: any; query: (args: any) => Promise<any> }) {
            const tenantId = ctx.getTenantId();
            if (tenantId && args.where && !('tenantId' in args.where)) {
              args.where = { ...args.where, tenantId };
            }
            return query(args);
          },
          async deleteMany({ args, query }: { args: any; query: (args: any) => Promise<any> }) {
            const tenantId = ctx.getTenantId();
            if (tenantId && args.where && !('tenantId' in args.where)) {
              args.where = { ...args.where, tenantId };
            }
            return query(args);
          },
        },
      },
    });
  }
}
