import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TenantContext } from '../tenant-context';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Tenant resolution priority:
    // 1. Header: x-tenant-id or x-tenant-slug
    // 2. Query param: ?tenantId= or ?tenant=
    // 3. Custom domain (CNAME): match against tenants.domain
    // 4. Subdomain: extract from host header
    // 5. Fallback: 'cleo' (development)

    let tenantIdentifier =
      request.headers['x-tenant-id'] ||
      request.headers['x-tenant-slug'] ||
      request.query.tenantId ||
      request.query.tenant;

    // Custom domain resolution (CNAME)
    // When a tenant configures a custom domain like "tienda.pe",
    // the DNS CNAME points to the platform. We match the incoming
    // host against the tenants.domain column.
    if (!tenantIdentifier && request.headers.host) {
      const host = request.headers.host.split(':')[0]; // Remove port

      // First try exact domain match (custom domain)
      const domainTenant = await (this.prisma as any).tenant.findFirst({
        where: { domain: host, active: true },
        include: { settings: true },
      });

      if (domainTenant) {
        request.tenant = domainTenant;
        this.tenantContext.setTenantId(domainTenant.id);
        return true;
      }

      // Then try subdomain resolution
      const parts = host.split('.');
      if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'localhost') {
        tenantIdentifier = parts[0];
      }
    }

    // Fallback for development
    if (!tenantIdentifier) {
      tenantIdentifier = 'cleo';
    }

    let tenant;
    if (!isNaN(Number(tenantIdentifier))) {
      tenant = await this.prisma.tenant.findUnique({
        where: { id: BigInt(tenantIdentifier) },
        include: { settings: true },
      });
    } else {
      tenant = await this.prisma.tenant.findUnique({
        where: { slug: String(tenantIdentifier).toLowerCase() },
        include: { settings: true },
      });
    }

    if (!tenant || !tenant.active) {
      throw new NotFoundException(`Tenant '${tenantIdentifier}' not found or inactive.`);
    }

    request.tenant = tenant;

    // Set tenant ID in AsyncLocalStorage for automatic Prisma filtering
    this.tenantContext.setTenantId(tenant.id);

    return true;
  }
}
