import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantContext } from '../tenant-context';

/**
 * Middleware that wraps the entire request lifecycle in an AsyncLocalStorage
 * context. The TenantGuard (which runs after this middleware) will populate
 * the tenantId via TenantContext.setTenantId().
 *
 * Prisma middleware then reads from TenantContext.getTenantId() to
 * automatically add tenantId filtering to read queries.
 */
@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(private readonly tenantContext: TenantContext) {}

  use(_req: Request, _res: Response, next: NextFunction): void {
    this.tenantContext.run(
      { tenantId: undefined, bypassFilter: false },
      () => {
        next();
      },
    );
  }
}
