import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Safe BigInt and Prisma Decimal serializer helper
function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (obj instanceof Date) return obj.toISOString();
  
  // Check if it is a Prisma Decimal (has toNumber or {s, e, d})
  if (typeof obj === 'object') {
    if (typeof obj.toNumber === 'function') {
      return obj.toNumber();
    }
    if (obj.d !== undefined && obj.e !== undefined && obj.s !== undefined) {
      return Number(obj.toString ? obj.toString() : obj.d.join(''));
    }
  }

  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  if (typeof obj === 'object') {
    const res: any = {};
    for (const key of Object.keys(obj)) {
      res[key] = serializeBigInt(obj[key]);
    }
    return res;
  }
  return obj;
}

export interface Response<T> {
  success: boolean;
  statusCode: number;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data) => ({
        success: true,
        statusCode,
        data: serializeBigInt(data),
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
