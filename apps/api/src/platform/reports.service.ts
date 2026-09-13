import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate a sales report as CSV data.
   *
   * Filters:
   *   - dateFrom / dateTo: date range
   *   - status: order status filter
   *
   * Returns CSV string with headers and data rows.
   */
  async generateSalesReport(tenantId: bigint, query?: {
    dateFrom?: string;
    dateTo?: string;
    status?: string;
  }) {
    const where: any = { tenantId };

    if (query?.dateFrom || query?.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
      if (query.dateTo) {
        const to = new Date(query.dateTo);
        to.setHours(23, 59, 59, 999);
        where.createdAt.lte = to;
      }
    }

    if (query?.status) {
      where.status = query.status;
    }

    const orders = await (this.prisma as any).order.findMany({
      where,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        items: true,
        payments: { where: { status: 'PAID' } },
        shipment: { select: { courier: true, trackingCode: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // CSV Headers
    const headers = [
      'N° Pedido',
      'Fecha',
      'Cliente',
      'Email',
      'Estado',
      'Estado Pago',
      'Subtotal',
      'Envío',
      'Descuento',
      'Total',
      'Moneda',
      'Ítems',
      'Método Pago',
      'Courier',
      'Tracking',
    ];

    // CSV Rows
    const rows = orders.map((order: any) => [
      order.orderNumber,
      order.createdAt.toISOString().split('T')[0],
      `${order.user.firstName} ${order.user.lastName}`,
      order.user.email,
      order.status,
      order.paymentStatus,
      Number(order.subtotal).toFixed(2),
      Number(order.shippingCost).toFixed(2),
      Number(order.discountAmount).toFixed(2),
      Number(order.total).toFixed(2),
      order.currency,
      order.items.length.toString(),
      order.payments[0]?.paymentMethod || 'N/A',
      order.shipment?.courier || 'N/A',
      order.shipment?.trackingCode || 'N/A',
    ]);

    // Build CSV string
    const csv = [
      headers.join(','),
      ...rows.map((row: string[]) => row.map((cell: string) => `"${cell.replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    // Summary stats
    const totalRevenue = orders.reduce((sum: number, o: any) => sum + Number(o.total), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      csv,
      summary: {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        dateRange: {
          from: query?.dateFrom || 'Inicio',
          to: query?.dateTo || 'Ahora',
        },
      },
      filename: `ventas-${tenantId}-${new Date().toISOString().split('T')[0]}.csv`,
    };
  }

  /**
   * Get sales trends data for charts (weekly/monthly aggregation).
   */
  async getSalesTrends(tenantId: bigint, query?: {
    period?: 'daily' | 'weekly' | 'monthly';
    dateFrom?: string;
    dateTo?: string;
  }) {
    const period = query?.period || 'weekly';

    const where: any = {
      tenantId,
      status: { notIn: ['CANCELLED'] },
    };

    if (query?.dateFrom || query?.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
      if (query.dateTo) {
        const to = new Date(query.dateTo);
        to.setHours(23, 59, 59, 999);
        where.createdAt.lte = to;
      }
    }

    // Get orders grouped by date
    const orders = await (this.prisma as any).order.findMany({
      where,
      select: {
        createdAt: true,
        total: true,
        status: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by period
    const grouped: Record<string, { revenue: number; orders: number }> = {};

    for (const order of orders) {
      let key: string;
      const date = new Date(order.createdAt);

      if (period === 'daily') {
        key = date.toISOString().split('T')[0];
      } else if (period === 'weekly') {
        // Get week start (Monday)
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        const weekStart = new Date(date.setDate(diff));
        key = weekStart.toISOString().split('T')[0];
      } else {
        // Monthly
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!grouped[key]) {
        grouped[key] = { revenue: 0, orders: 0 };
      }
      grouped[key].revenue += Number(order.total);
      grouped[key].orders += 1;
    }

    const trends = Object.entries(grouped).map(([period, data]) => ({
      period,
      revenue: data.revenue,
      orders: data.orders,
      averageOrderValue: data.orders > 0 ? data.revenue / data.orders : 0,
    }));

    return {
      period,
      trends,
      totalRevenue: trends.reduce((sum, t) => sum + t.revenue, 0),
      totalOrders: trends.reduce((sum, t) => sum + t.orders, 0),
    };
  }
}
