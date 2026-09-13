import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ShippingService {
  constructor(private readonly prisma: PrismaService) {}

  // ===================== STOREFRONT =====================

  async getShippingZones(tenantId: bigint) {
    return this.prisma.shippingZone.findMany({
      where: { tenantId, active: true },
      include: { rates: { where: { active: true } } },
    });
  }

  // ===================== ADMIN — SHIPMENT MANAGEMENT =====================

  async getAdminShipments(tenantId: bigint, query?: {
    status?: string;
    search?: string;
  }) {
    const where: any = { tenantId };

    if (query?.status) {
      where.status = query.status;
    }

    const shipments = await (this.prisma as any).shipment.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            createdAt: true,
          },
        },
        zone: { select: { name: true } },
        tracking: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { id: 'desc' },
    });

    let result = shipments.map((s: any) => ({
      id: s.id.toString(),
      orderId: s.orderId.toString(),
      orderNumber: s.order?.orderNumber,
      orderStatus: s.order?.status,
      orderTotal: Number(s.order?.total || 0),
      zone: s.zone?.name,
      courier: s.courier,
      deliveryService: s.deliveryService,
      trackingCode: s.trackingCode,
      shippingCost: Number(s.shippingCost),
      status: s.status,
      latestTracking: s.tracking?.[0] || null,
      shippedAt: s.shippedAt,
      deliveredAt: s.deliveredAt,
      createdAt: s.createdAt,
    }));

    if (query?.search) {
      const searchLower = query.search.toLowerCase();
      result = result.filter(
        (s: any) =>
          s.orderNumber?.toLowerCase().includes(searchLower) ||
          (s.trackingCode && s.trackingCode.toLowerCase().includes(searchLower)) ||
          (s.courier && s.courier.toLowerCase().includes(searchLower)),
      );
    }

    return result;
  }

  async getShipmentDetail(tenantId: bigint, shipmentId: bigint) {
    const shipment = await (this.prisma as any).shipment.findFirst({
      where: { id: shipmentId, tenantId },
      include: {
        order: {
          include: {
            items: true,
            shippingAddress: true,
            user: { select: { firstName: true, lastName: true, email: true, phone: true } },
          },
        },
        zone: { select: { name: true } },
        tracking: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!shipment) {
      throw new NotFoundException('Envío no encontrado');
    }

    return {
      id: shipment.id.toString(),
      order: {
        id: shipment.order?.id?.toString(),
        orderNumber: shipment.order?.orderNumber,
        status: shipment.order?.status,
        total: Number(shipment.order?.total || 0),
        items: shipment.order?.items,
        shippingAddress: shipment.order?.shippingAddress,
        customer: shipment.order?.user,
      },
      zone: shipment.zone?.name,
      courier: shipment.courier,
      deliveryService: shipment.deliveryService,
      trackingCode: shipment.trackingCode,
      shippingCost: Number(shipment.shippingCost),
      status: shipment.status,
      shippedAt: shipment.shippedAt,
      deliveredAt: shipment.deliveredAt,
      tracking: (shipment.tracking || []).map((t: any) => ({
        id: t.id.toString(),
        status: t.status,
        location: t.location,
        description: t.description,
        createdAt: t.createdAt,
      })),
    };
  }

  async assignCourier(tenantId: bigint, shipmentId: bigint, data: {
    courier: string;
    deliveryService?: string;
    trackingCode: string;
  }) {
    const shipment = await (this.prisma as any).shipment.findFirst({
      where: { id: shipmentId, tenantId },
    });

    if (!shipment) {
      throw new NotFoundException('Envío no encontrado');
    }

    if (shipment.status === 'DELIVERED') {
      throw new BadRequestException('No se puede modificar un envío ya entregado');
    }

    const validCouriers = ['Olva', 'Shalom', '99Minutos', 'Platanitos', 'Civa', 'Otro'];
    if (!validCouriers.includes(data.courier)) {
      throw new BadRequestException(
        `Courier inválido. Opciones válidas: ${validCouriers.join(', ')}`,
      );
    }

    const updated = await (this.prisma as any).shipment.update({
      where: { id: shipmentId },
      data: {
        courier: data.courier,
        deliveryService: data.deliveryService || data.courier,
        trackingCode: data.trackingCode,
      },
    });

    await (this.prisma as any).shipmentTracking.create({
      data: {
        shipmentId,
        status: 'CURSOR_ASIGNADO',
        description: `Courier ${data.courier} asignado. Código de seguimiento: ${data.trackingCode}`,
      },
    });

    return updated;
  }

  async addTrackingEvent(tenantId: bigint, shipmentId: bigint, data: {
    status: string;
    location?: string;
    description: string;
  }) {
    const shipment = await (this.prisma as any).shipment.findFirst({
      where: { id: shipmentId, tenantId },
      include: { order: true },
    });

    if (!shipment) {
      throw new NotFoundException('Envío no encontrado');
    }

    const validStatuses = [
      'ORDEN_CREADA',
      'PAGO_CONFIRMADO',
      'EN_PREPARACION',
      'CURSOR_ASIGNADO',
      'EN_TRANSITO',
      'EN_REPARTO',
      'ENTREGADO',
      'REEMBOLSADO',
      'DEVUELTO',
    ];

    if (!validStatuses.includes(data.status)) {
      throw new BadRequestException(
        `Estado inválido. Opciones válidas: ${validStatuses.join(', ')}`,
      );
    }

    const shipmentUpdate: any = {};
    if (data.status === 'EN_TRANSITO') shipmentUpdate.status = 'SHIPPED';
    if (data.status === 'ENTREGADO') {
      shipmentUpdate.status = 'DELIVERED';
      shipmentUpdate.deliveredAt = new Date();
    }

    if (Object.keys(shipmentUpdate).length > 0) {
      await (this.prisma as any).shipment.update({
        where: { id: shipmentId },
        data: shipmentUpdate,
      });

      if (data.status === 'EN_TRANSITO') {
        await (this.prisma as any).order.update({
          where: { id: shipment.orderId },
          data: { fulfillmentStatus: 'SHIPPED', status: 'SHIPPED' },
        });
      } else if (data.status === 'ENTREGADO') {
        await (this.prisma as any).order.update({
          where: { id: shipment.orderId },
          data: { fulfillmentStatus: 'DELIVERED', status: 'DELIVERED' },
        });
      }
    }

    const trackingEvent = await (this.prisma as any).shipmentTracking.create({
      data: {
        shipmentId,
        status: data.status,
        location: data.location,
        description: data.description,
      },
    });

    return trackingEvent;
  }
}
