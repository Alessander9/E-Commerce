import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(
    tenantId: bigint,
    userId: bigint,
    data: {
      items: Array<{ variantId: string; quantity: number }>;
      shippingAddress: {
        department: string;
        province: string;
        district: string;
        addressLine: string;
        reference?: string;
        postalCode?: string;
      };
      shippingZoneId?: string;
      couponCode?: string;
    },
  ) {
    if (!data.items || data.items.length === 0) {
      throw new BadRequestException('El pedido debe incluir al menos un producto');
    }

    return this.prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsData = [];

      // 1. Process items, calculate subtotal and check/reserve inventory
      for (const item of data.items) {
        const variantId = BigInt(item.variantId);
        const variant = await tx.productVariant.findUnique({
          where: { id: variantId },
          include: {
            product: true,
            prices: { where: { isActive: true }, take: 1 },
            inventory: true,
          },
        });

        if (!variant || !variant.active || variant.product.tenantId !== tenantId) {
          throw new BadRequestException(`Variante #${item.variantId} no disponible en esta tienda`);
        }

        if (!variant.prices[0]) {
          throw new BadRequestException(`Variante ${variant.sku} no tiene precio activo configurado`);
        }

        const unitPrice = Number(variant.prices[0].price);
        const itemSubtotal = unitPrice * item.quantity;
        subtotal += itemSubtotal;

        // Check Stock
        if (variant.inventory) {
          if (variant.inventory.availableStock < item.quantity) {
            throw new BadRequestException(
              `Stock insuficiente para ${variant.product.name} (${variant.sku}). Disponible: ${variant.inventory.availableStock}`,
            );
          }

          // Reserve Stock
          await tx.inventory.update({
            where: { id: variant.inventory.id },
            data: {
              availableStock: { decrement: item.quantity },
              reservedStock: { increment: item.quantity },
            },
          });

          // Log Movement
          await tx.inventoryMovement.create({
            data: {
              tenantId,
              variantId: variant.id,
              movementType: 'RESERVATION',
              quantity: item.quantity,
              stockBefore: variant.inventory.availableStock,
              stockAfter: variant.inventory.availableStock - item.quantity,
              referenceType: 'ORDER_CREATION',
              note: `Reserva por creación de pedido para usuario #${userId}`,
            },
          });
        }

        orderItemsData.push({
          productId: variant.productId,
          variantId: variant.id,
          productName: variant.product.name,
          productSku: variant.sku,
          variantName: variant.name,
          unitPrice,
          quantity: item.quantity,
          subtotal: itemSubtotal,
          productSnapshot: {
            brand: variant.product.brand,
            weight: variant.weight,
            price: unitPrice,
          },
        });
      }

      // 2. Shipping calculation
      let shippingCost = 10.00;
      let zoneId = null;
      if (data.shippingZoneId) {
        zoneId = BigInt(data.shippingZoneId);
        const zone = await tx.shippingZone.findUnique({
          where: { id: zoneId },
          include: { rates: { take: 1 } },
        });
        if (zone && zone.rates.length > 0) {
          shippingCost = Number(zone.rates[0].price);
        }
      }

      // 3. Discount calculation
      let discountAmount = 0.00;
      let appliedCouponId = null;
      if (data.couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: {
            tenantId_code: {
              tenantId,
              code: data.couponCode.toUpperCase().trim(),
            },
          },
        });

        if (coupon && coupon.active && new Date() <= coupon.endDate) {
          if (coupon.discountType === 'PERCENTAGE') {
            discountAmount = (subtotal * Number(coupon.discountValue)) / 100;
            if (coupon.maxDiscountAmount && discountAmount > Number(coupon.maxDiscountAmount)) {
              discountAmount = Number(coupon.maxDiscountAmount);
            }
          } else if (coupon.discountType === 'FIXED_AMOUNT') {
            discountAmount = Number(coupon.discountValue);
          } else if (coupon.discountType === 'FREE_SHIPPING') {
            discountAmount = shippingCost;
          }
          appliedCouponId = coupon.id;
        }
      }

      const total = Math.max(0, subtotal + shippingCost - discountAmount);
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

      // 4. Create Order with Relations
      const order = await tx.order.create({
        data: {
          tenantId,
          userId,
          orderNumber,
          status: 'PENDING_PAYMENT',
          subtotal,
          shippingCost,
          discountAmount,
          taxAmount: total * 0.18, // 18% IGV referencial
          total,
          currency: 'PEN',
          paymentStatus: 'PENDING',
          fulfillmentStatus: 'UNFULFILLED',
          shippingAddress: {
            create: {
              department: data.shippingAddress.department,
              province: data.shippingAddress.province,
              district: data.shippingAddress.district,
              addressLine: data.shippingAddress.addressLine,
              reference: data.shippingAddress.reference,
              postalCode: data.shippingAddress.postalCode,
            },
          },
          items: {
            create: orderItemsData,
          },
          statusHistory: {
            create: {
              changedBy: userId,
              status: 'PENDING_PAYMENT',
              note: 'Pedido generado por el cliente',
            },
          },
          shipment: {
            create: {
              tenantId,
              zoneId,
              shippingCost,
              status: 'PENDING',
              tracking: {
                create: {
                  status: 'ORDEN_CREADA',
                  description: 'Pedido registrado en Cleo Platform a la espera de confirmación de pago',
                },
              },
            },
          },
        },
        include: {
          items: true,
          shippingAddress: true,
          shipment: { include: { tracking: true } },
        },
      });

      // 5. Coupon Redemption record if applied
      if (appliedCouponId) {
        await tx.couponRedemption.create({
          data: {
            couponId: appliedCouponId,
            userId,
            orderId: order.id,
            discountAmount,
          },
        });
        await tx.coupon.update({
          where: { id: appliedCouponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      return order;
    });
  }

  async getUserOrders(tenantId: bigint, userId: bigint) {
    return this.prisma.order.findMany({
      where: { tenantId, userId },
      include: {
        items: true,
        shippingAddress: true,
        payments: true,
        shipment: { include: { tracking: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAdminOrders(tenantId: bigint) {
    return this.prisma.order.findMany({
      where: { tenantId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        items: true,
        shippingAddress: true,
        payments: true,
        shipment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderById(tenantId: bigint, orderId: bigint) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, slug: true } },
            variant: { select: { id: true, sku: true, name: true } },
          },
        },
        shippingAddress: true,
        payments: true,
        shipment: {
          include: { tracking: { orderBy: { createdAt: 'asc' } } },
        },
        statusHistory: {
          include: { user: { select: { firstName: true, lastName: true, email: true } } },
          orderBy: { createdAt: 'asc' },
        },
        couponRedemptions: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Pedido no encontrado en esta tienda');
    }

    return order;
  }

  /**
   * Update order status with transition validation.
   * Valid transitions:
   *   PENDING_PAYMENT → PAID, CANCELLED
   *   PAID → PROCESSING, CANCELLED
   *   PROCESSING → READY_TO_SHIP, CANCELLED
   *   READY_TO_SHIP → SHIPPED
   *   SHIPPED → DELIVERED
   */
  async updateOrderStatus(
    tenantId: bigint,
    orderId: bigint,
    userId: bigint,
    data: {
      status: string;
      note?: string;
      courier?: string;
      trackingCode?: string;
    },
  ) {
    const validTransitions: Record<string, string[]> = {
      PENDING_PAYMENT: ['PAID', 'CANCELLED'],
      PAID: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['READY_TO_SHIP', 'CANCELLED'],
      READY_TO_SHIP: ['SHIPPED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: [],
      CANCELLED: [],
    };

    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId },
      include: {
        items: { include: { variant: { include: { inventory: true } } } },
        shipment: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Pedido no encontrado en esta tienda');
    }

    const allowed = validTransitions[order.status];
    if (!allowed || !allowed.includes(data.status)) {
      throw new BadRequestException(
        `No se puede cambiar de '${order.status}' a '${data.status}'. Transiciones permitidas: ${allowed?.join(', ') || 'ninguna'}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Update order status
      const updateData: any = {
        status: data.status,
      };

      if (data.status === 'CANCELLED') {
        updateData.cancelledAt = new Date();
        updateData.fulfillmentStatus = 'CANCELLED';
      } else if (data.status === 'READY_TO_SHIP') {
        updateData.fulfillmentStatus = 'READY_TO_SHIP';
      } else if (data.status === 'SHIPPED') {
        updateData.fulfillmentStatus = 'SHIPPED';
      } else if (data.status === 'DELIVERED') {
        updateData.fulfillmentStatus = 'DELIVERED';
      }

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: updateData,
      });

      // 2. Record status history
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          changedBy: userId,
          status: data.status,
          note: data.note || `Estado cambiado a ${data.status}`,
        },
      });

      // 3. Handle cancellation — release reserved stock
      if (data.status === 'CANCELLED') {
        for (const item of order.items) {
          if (item.variant?.inventory) {
            await tx.inventory.update({
              where: { id: item.variant.inventory.id },
              data: {
                availableStock: { increment: item.quantity },
                reservedStock: { decrement: item.quantity },
              },
            });

            await tx.inventoryMovement.create({
              data: {
                tenantId,
                variantId: item.variantId,
                movementType: 'RELEASE',
                quantity: item.quantity,
                stockBefore: item.variant.inventory.availableStock,
                stockAfter: item.variant.inventory.availableStock + item.quantity,
                referenceType: 'ORDER_CANCELLED',
                referenceId: orderId,
                note: `Stock liberado por cancelación del pedido #${order.orderNumber}`,
                createdBy: userId,
              },
            });
          }
        }
      }

      // 4. Handle shipment updates
      if (order.shipment && (data.status === 'READY_TO_SHIP' || data.status === 'SHIPPED')) {
        const shipmentUpdate: any = {};
        if (data.courier) shipmentUpdate.courier = data.courier;
        if (data.trackingCode) shipmentUpdate.trackingCode = data.trackingCode;
        if (data.status === 'SHIPPED') {
          shipmentUpdate.status = 'SHIPPED';
          shipmentUpdate.shippedAt = new Date();
        }

        await tx.shipment.update({
          where: { id: order.shipment.id },
          data: shipmentUpdate,
        });

        // Add tracking event
        const trackingStatus = data.status === 'SHIPPED' ? 'EN_TRANSITO' : 'EN_PREPARACION';
        await tx.shipmentTracking.create({
          data: {
            shipmentId: order.shipment.id,
            status: trackingStatus,
            description: data.status === 'SHIPPED'
              ? `Pedido despachado con courier ${data.courier || 'N/A'}. Tracking: ${data.trackingCode || 'Pendiente'}`
              : 'Pedido en preparación para envío',
          },
        });
      }

      // 5. Handle delivered — confirm final delivery
      if (data.status === 'DELIVERED' && order.shipment) {
        await tx.shipment.update({
          where: { id: order.shipment.id },
          data: { status: 'DELIVERED', deliveredAt: new Date() },
        });

        await tx.shipmentTracking.create({
          data: {
            shipmentId: order.shipment.id,
            status: 'ENTREGADO',
            description: 'Pedido entregado exitosamente al destinatario',
          },
        });
      }

      return updatedOrder;
    });
  }
}
