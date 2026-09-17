import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const currentTenant = request.tenant;

    if (!user) {
      throw new ForbiddenException('User is not authenticated');
    }

    const activeMemberships = (user.userTenants || []).filter((ut: any) => ut.active);

    // 1. Super Admin with PLATFORM scope has global authority
    const isPlatformSuperAdmin = activeMemberships.some(
      (ut: any) => ut.role?.name === 'SUPER_ADMIN' || ut.role?.scope === 'PLATFORM',
    );

    if (isPlatformSuperAdmin) {
      return true;
    }

    // 2. Check user roles in current tenant (or across active memberships if no tenant context)
    const userRoles = activeMemberships
      .filter((ut: any) => {
        if (!currentTenant) return true;
        return ut.tenantId === currentTenant.id;
      })
      .map((ut: any) => ut.role.name);

    const hasRequiredRole = requiredRoles.some((role) =>
      userRoles.includes(role),
    );

    if (!hasRequiredRole) {
      throw new ForbiddenException(
        `Access denied. Required role: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
