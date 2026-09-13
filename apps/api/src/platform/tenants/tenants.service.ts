import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tenant.findMany({
      include: {
        settings: true,
        _count: {
          select: {
            products: true,
            orders: true,
            userTenants: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: bigint) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        settings: true,
        userTenants: {
          include: {
            user: true,
            role: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant no encontrado');
    }

    return tenant;
  }

  async findBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: slug.toLowerCase() },
      include: { settings: true },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant con slug '${slug}' no encontrado`);
    }

    return tenant;
  }

  async create(data: {
    name: string;
    slug: string;
    domain?: string;
    subdomain?: string;
    description?: string;
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
  }) {
    const existing = await this.prisma.tenant.findUnique({
      where: { slug: data.slug.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException(`El slug '${data.slug}' ya está en uso.`);
    }

    return this.prisma.tenant.create({
      data: {
        name: data.name,
        slug: data.slug.toLowerCase(),
        domain: data.domain,
        subdomain: data.subdomain,
        description: data.description,
        primaryColor: data.primaryColor || '#6A2CFF',
        secondaryColor: data.secondaryColor || '#1976FF',
        logoUrl: data.logoUrl || '/logo-tienda.png',
        active: true,
        settings: {
          create: {
            currency: 'PEN',
            timezone: 'America/Lima',
            locale: 'es_PE',
          },
        },
      },
      include: { settings: true },
    });
  }

  async update(id: bigint, data: Partial<{
    name: string;
    description: string;
    domain: string;
    subdomain: string;
    primaryColor: string;
    secondaryColor: string;
    logoUrl: string;
    active: boolean;
  }>) {
    return this.prisma.tenant.update({
      where: { id },
      data,
      include: { settings: true },
    });
  }

  // ===================== TENANT LIFECYCLE =====================

  /**
   * Suspend a tenant — sets active=false and status=SUSPENDED.
   * The storefront will return 404 for this tenant.
   */
  async suspendTenant(id: bigint) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant no encontrado');
    if (!tenant.active) throw new BadRequestException('El tenant ya está suspendido');

    return this.prisma.tenant.update({
      where: { id },
      data: { active: false, status: 'SUSPENDED' },
      include: { settings: true },
    });
  }

  /**
   * Reactivate a suspended tenant.
   */
  async reactivateTenant(id: bigint) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant no encontrado');
    if (tenant.active) throw new BadRequestException('El tenant ya está activo');

    return this.prisma.tenant.update({
      where: { id },
      data: { active: true, status: 'ACTIVE' },
      include: { settings: true },
    });
  }

  /**
   * Soft-delete a tenant — sets deletedAt and active=false.
   * This preserves data while hiding the tenant from all operations.
   */
  async deleteTenant(id: bigint) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant no encontrado');

    return this.prisma.tenant.update({
      where: { id },
      data: { active: false, status: 'DELETED', deletedAt: new Date() },
    });
  }

  // ===================== TENANT SETTINGS =====================

  /**
   * Get tenant settings for admin editing.
   */
  async getTenantSettings(tenantId: bigint) {
    const settings = await this.prisma.tenantSettings.findUnique({
      where: { tenantId },
    });

    if (!settings) {
      throw new NotFoundException('Configuración del tenant no encontrada');
    }

    return settings;
  }

  /**
   * Update tenant settings (Tenant Admin).
   */
  async updateTenantSettings(tenantId: bigint, data: {
    currency?: string;
    timezone?: string;
    locale?: string;
    supportEmail?: string;
    supportPhone?: string;
    address?: string;
    businessHours?: any;
    settings?: any;
  }) {
    const existing = await this.prisma.tenantSettings.findUnique({
      where: { tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Configuración del tenant no encontrada');
    }

    return this.prisma.tenantSettings.update({
      where: { tenantId },
      data,
    });
  }

  // ===================== USER-TENANT ASSIGNMENT =====================

  /**
   * Assign a user to a tenant with a specific role.
   */
  async assignUserToTenant(data: {
    userId: string;
    tenantId: string;
    roleId: string;
  }) {
    const userId = BigInt(data.userId);
    const tenantId = BigInt(data.tenantId);
    const roleId = Number(data.roleId);

    // Verify user exists
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // Verify tenant exists
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant no encontrado');

    // Verify role exists
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Rol no encontrado');

    // Check if already assigned
    const existing = await this.prisma.userTenant.findUnique({
      where: { userId_tenantId: { userId, tenantId } },
    });

    if (existing) {
      // Update role
      return this.prisma.userTenant.update({
        where: { userId_tenantId: { userId, tenantId } },
        data: { roleId, active: true },
        include: { user: true, role: true, tenant: true },
      });
    }

    return this.prisma.userTenant.create({
      data: { userId, tenantId, roleId },
      include: { user: true, role: true, tenant: true },
    });
  }

  /**
   * Remove a user from a tenant.
   */
  async removeUserFromTenant(userId: bigint, tenantId: bigint) {
    const membership = await this.prisma.userTenant.findUnique({
      where: { userId_tenantId: { userId, tenantId } },
    });

    if (!membership) {
      throw new NotFoundException('El usuario no pertenece a este tenant');
    }

    return this.prisma.userTenant.update({
      where: { userId_tenantId: { userId, tenantId } },
      data: { active: false },
    });
  }

  /**
   * Get all roles available in the system.
   */
  async getRoles() {
    return this.prisma.role.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });
  }
}
