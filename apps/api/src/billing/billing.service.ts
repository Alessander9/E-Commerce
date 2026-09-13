import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  // ===================== PLANS =====================

  /**
   * Get all available plans with their limits.
   */
  async getPlans() {
    return (this.prisma as any).plan.findMany({
      where: { active: true },
      include: { limits: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * Create a new plan (Platform Super Admin only).
   */
  async createPlan(data: {
    name: string;
    displayName: string;
    description?: string;
    price: number;
    currency?: string;
    billingCycle?: string;
    limits: Array<{ resource: string; maxLimit: number; description?: string }>;
  }) {
    return (this.prisma as any).plan.create({
      data: {
        name: data.name.toUpperCase(),
        displayName: data.displayName,
        description: data.description,
        price: data.price,
        currency: data.currency || 'PEN',
        billingCycle: data.billingCycle || 'MONTHLY',
        active: true,
        limits: {
          create: data.limits.map((l) => ({
            resource: l.resource,
            maxLimit: l.maxLimit,
            description: l.description,
          })),
        },
      },
      include: { limits: true },
    });
  }

  /**
   * Update a plan.
   */
  async updatePlan(planId: number, data: Partial<{
    displayName: string;
    description: string;
    price: number;
    active: boolean;
  }>) {
    return (this.prisma as any).plan.update({
      where: { id: planId },
      data,
      include: { limits: true },
    });
  }

  // ===================== SUBSCRIPTIONS =====================

  /**
   * Get the current subscription for a tenant.
   */
  async getTenantSubscription(tenantId: bigint) {
    const subscription = await (this.prisma as any).subscription.findUnique({
      where: { tenantId },
      include: {
        plan: {
          include: { limits: true },
        },
      },
    });

    if (!subscription) {
      // Return default free plan info
      return {
        status: 'NONE',
        plan: null,
        limits: [],
        usage: await this.getTenantUsage(tenantId),
      };
    }

    const usage = await this.getTenantUsage(tenantId);

    return {
      ...subscription,
      usage,
    };
  }

  /**
   * Assign or change a tenant's subscription plan.
   */
  async assignPlan(tenantId: bigint, planId: number) {
    // Verify plan exists
    const plan = await (this.prisma as any).plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plan no encontrado');
    }

    // Verify tenant exists
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant no encontrado');
    }

    // Check if subscription already exists
    const existing = await (this.prisma as any).subscription.findUnique({
      where: { tenantId },
    });

    const now = new Date();
    const periodEnd = new Date(now);
    if (plan.billingCycle === 'YEARLY') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    if (existing) {
      return (this.prisma as any).subscription.update({
        where: { tenantId },
        data: {
          planId,
          status: 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          cancelledAt: null,
        },
        include: { plan: { include: { limits: true } } },
      });
    }

    return (this.prisma as any).subscription.create({
      data: {
        tenantId,
        planId,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
      include: { plan: { include: { limits: true } } },
    });
  }

  /**
   * Cancel a tenant's subscription.
   */
  async cancelSubscription(tenantId: bigint) {
    const subscription = await (this.prisma as any).subscription.findUnique({
      where: { tenantId },
    });

    if (!subscription) {
      throw new NotFoundException('Suscripción no encontrada');
    }

    return (this.prisma as any).subscription.update({
      where: { tenantId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
      include: { plan: { include: { limits: true } } },
    });
  }

  // ===================== USAGE & LIMITS =====================

  /**
   * Get current usage for a tenant (products, orders, users).
   */
  async getTenantUsage(tenantId: bigint) {
    const [productCount, orderCount, userCount] = await Promise.all([
      this.prisma.product.count({
        where: { tenantId, deletedAt: null },
      }),
      this.prisma.order.count({
        where: { tenantId },
      }),
      (this.prisma as any).userTenant.count({
        where: { tenantId, active: true },
      }),
    ]);

    return {
      products: productCount,
      orders: orderCount,
      users: userCount,
    };
  }

  /**
   * Check if a tenant has exceeded a specific plan limit.
   *
   * Returns { allowed: boolean, current: number, max: number, resource: string }
   */
  async checkLimit(tenantId: bigint, resource: string) {
    const subscription = await (this.prisma as any).subscription.findUnique({
      where: { tenantId },
      include: { plan: { include: { limits: true } } },
    });

    if (!subscription || subscription.status !== 'ACTIVE') {
      // No active subscription — use free tier limits
      return { allowed: true, current: 0, max: 0, resource, isFreeTier: true };
    }

    const limit = subscription.plan.limits.find((l: any) => l.resource === resource);
    if (!limit) {
      // No limit defined for this resource — allow
      return { allowed: true, current: 0, max: -1, resource };
    }

    // -1 means unlimited
    if (limit.maxLimit === -1) {
      return { allowed: true, current: 0, max: -1, resource };
    }

    const usage = await this.getTenantUsage(tenantId);
    const current = (usage as any)[resource] || 0;

    return {
      allowed: current < limit.maxLimit,
      current,
      max: limit.maxLimit,
      resource,
      isFreeTier: false,
    };
  }

  /**
   * Enforce a limit before allowing a create operation.
   * Throws if limit exceeded.
   */
  async enforceLimit(tenantId: bigint, resource: string): Promise<void> {
    const check = await this.checkLimit(tenantId, resource);

    if (!check.allowed) {
      throw new BadRequestException(
        `Límite de plan alcanzado: ${resource} (${check.current}/${check.max}). ` +
        `Actualiza tu plan para continuar.`,
      );
    }
  }
}
