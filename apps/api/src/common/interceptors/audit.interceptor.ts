import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { PrismaService } from '../../database/prisma.service';

/**
 * Maps HTTP methods to audit actions.
 */
const METHOD_ACTION_MAP: Record<string, string> = {
  POST: 'CREATE',
  PUT: 'UPDATE',
  PATCH: 'UPDATE',
  DELETE: 'DELETE',
};

/**
 * Maps URL path segments to entity names.
 */
function extractEntity(url: string): string {
  // Remove query params
  const path = url.split('?')[0];
  const segments = path.split('/').filter(Boolean);

  // Find the last meaningful segment (skip IDs and param placeholders)
  // e.g., /api/admin/products/123 → product
  // e.g., /api/store/orders → order
  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i];
    // Skip numeric IDs, UUIDs, and param placeholders like :id
    if (/^\d+$/.test(seg) || /^[0-9a-f-]{36}$/i.test(seg) || seg.startsWith(':')) {
      continue;
    }
    // Skip common verb-like segments
    if (['api', 'admin', 'store', 'platform', 'process', 'validate', 'public'].includes(seg)) {
      continue;
    }
    // Plural → singular
    return seg.endsWith('s') ? seg.slice(0, -1) : seg;
  }

  return 'unknown';
}

/**
 * Interceptor that automatically logs mutating HTTP requests (POST, PUT, PATCH, DELETE)
 * to the `audit_logs` table.
 *
 * Registers as a global interceptor in main.ts or applied per-controller.
 *
 * Usage:
 *   @UseInterceptors(AuditInterceptor)
 *   export class SomeController { ... }
 *
 * Or globally:
 *   app.useGlobalInterceptors(app.get(AuditInterceptor));
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AuditInterceptor');

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user, tenant, ip, headers } = request;

    // Only audit mutating operations
    const action = METHOD_ACTION_MAP[method];
    if (!action) {
      return next.handle();
    }

    const entity = extractEntity(url);
    const tenantId = tenant?.id || null;
    const userId = user?.id || null;
    const ipAddress = ip || headers['x-forwarded-for'] || null;
    const userAgent = headers['user-agent'] || null;
    const startTime = Date.now();

    return next.handle().pipe(
      tap((responseData) => {
        // Log successful mutation
        this.logAudit({
          tenantId,
          userId,
          action,
          entity,
          entityId: responseData?.id || null,
          oldValue: null, // We don't have the old value in a simple interceptor
          newValue: this.sanitizeBody(body),
          ipAddress,
          userAgent,
        }).catch((err) => {
          this.logger.error(`Failed to write audit log: ${err.message}`);
        });
      }),
      catchError((error) => {
        // Log failed mutation attempt
        this.logAudit({
          tenantId,
          userId,
          action: `${action}_FAILED`,
          entity,
          entityId: null,
          oldValue: null,
          newValue: {
            error: error.message,
            requestBody: this.sanitizeBody(body),
          },
          ipAddress,
          userAgent,
        }).catch((err) => {
          this.logger.error(`Failed to write audit log for failed action: ${err.message}`);
        });

        // Re-throw the original error
        throw error;
      }),
    );
  }

  /**
   * Write audit log entry to the database.
   */
  private async logAudit(data: {
    tenantId: bigint | null;
    userId: bigint | null;
    action: string;
    entity: string;
    entityId: bigint | null;
    oldValue: any;
    newValue: any;
    ipAddress: string | null;
    userAgent: string | null;
  }): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        tenantId: data.tenantId,
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        oldValue: data.oldValue,
        newValue: data.newValue,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  /**
   * Sanitize request body to remove sensitive fields like passwords and tokens.
   */
  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') return body;

    const sensitiveFields = new Set([
      'password',
      'newPassword',
      'token',
      'secret',
      'apiKey',
      'accessToken',
    ]);

    const sanitized: any = Array.isArray(body) ? [] : {};

    for (const [key, value] of Object.entries(body)) {
      if (sensitiveFields.has(key)) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeBody(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}
