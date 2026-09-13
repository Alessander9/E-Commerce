import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PlatformService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardOverview() {
    // 1. Consolidated Counts
    const [
      totalTenants,
      activeTenants,
      totalUsers,
      totalProducts,
      totalOrders,
      ordersAgg,
    ] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.tenant.count({ where: { active: true } }),
      this.prisma.user.count(),
      this.prisma.product.count(),
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        _sum: {
          total: true,
        },
      }),
    ]);

    const totalRevenue = Number(ordersAgg._sum.total || 0);

    // 2. Tenants Performance & Breakdown
    const tenantsBreakdown = await this.prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        active: true,
        logoUrl: true,
        primaryColor: true,
        createdAt: true,
        _count: {
          select: {
            products: true,
            orders: true,
            userTenants: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // 3. Recent Orders across platform
    const recentOrders = await this.prisma.order.findMany({
      include: {
        tenant: {
          select: {
            name: true,
            slug: true,
          },
        },
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 8,
    });

    // 4. System Status
    const systemStatus = {
      database: 'CONNECTED',
      serverUptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    };

    return {
      kpis: {
        totalTenants,
        activeTenants,
        inactiveTenants: totalTenants - activeTenants,
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
      },
      tenantsBreakdown,
      recentOrders,
      systemStatus,
    };
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      include: {
        userTenants: {
          include: {
            tenant: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            role: true,
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async toggleUserStatus(userId: bigint, active: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { active },
    });
  }

  async getAuditLogs() {
    return this.prisma.auditLog.findMany({
      include: {
        tenant: {
          select: {
            name: true,
            slug: true,
          },
        },
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });
  }
}
