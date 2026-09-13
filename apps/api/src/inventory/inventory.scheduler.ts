import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';

/**
 * Scheduled tasks for inventory management.
 *
 * - Releases reserved stock from unpaid orders after 30 minutes.
 * - Logs all stock releases for audit trail.
 */
@Injectable()
export class InventoryScheduler {
  private readonly logger = new Logger('InventoryScheduler');

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Run every 5 minutes to find and release reserved stock
   * from orders that were created more than 30 minutes ago
   * and are still in PENDING_PAYMENT status.
   *
   * This prevents stock from being permanently locked by
   * abandoned checkouts.
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async releaseExpiredReservations() {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    // Find orders that are pending payment and older than 30 minutes
    const expiredOrders = await this.prisma.order.findMany({
      where: {
        status: 'PENDING_PAYMENT',
        paymentStatus: 'PENDING',
        createdAt: { lt: thirtyMinutesAgo },
      },
      include: {
        items: {
          include: {
            variant: {
              include: { inventory: true },
            },
          },
        },
      },
    });

    if (expiredOrders.length === 0) {
      return; // No expired orders, nothing to do
    }

    this.logger.log(
      `Found ${expiredOrders.length} unpaid order(s) older than 30 minutes. Releasing reserved stock...`,
    );

    let releasedCount = 0;

    for (const order of expiredOrders) {
      try {
        await this.prisma.$transaction(async (tx) => {
          // 1. Release reserved stock for each item
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
                  tenantId: order.tenantId,
                  variantId: item.variantId,
                  movementType: 'RELEASE',
                  quantity: item.quantity,
                  stockBefore: item.variant.inventory.availableStock,
                  stockAfter: item.variant.inventory.availableStock + item.quantity,
                  referenceType: 'ORDER_EXPIRED',
                  referenceId: order.id,
                  note: `Stock liberado: pedido #${order.orderNumber} no pagado tras 30 minutos`,
                },
              });
            }
          }

          // 2. Update order status to CANCELLED
          await tx.order.update({
            where: { id: order.id },
            data: {
              status: 'CANCELLED',
              cancelledAt: new Date(),
              fulfillmentStatus: 'CANCELLED',
            },
          });

          // 3. Record status history
          await tx.orderStatusHistory.create({
            data: {
              orderId: order.id,
              status: 'CANCELLED',
              note: 'Pedido cancelado automáticamente: pago no recibido tras 30 minutos. Stock liberado.',
            },
          });

          // 4. Update shipment tracking if exists
          const shipment = await tx.shipment.findUnique({
            where: { orderId: order.id },
          });

          if (shipment) {
            await tx.shipmentTracking.create({
              data: {
                shipmentId: shipment.id,
                status: 'PEDIDO_CANCELADO',
                description: 'Pedido cancelado por falta de pago. Stock devuelto al inventario.',
              },
            });
          }
        });

        releasedCount++;
        this.logger.log(
          `Released stock for order #${order.orderNumber} (${order.items.length} items)`,
        );
      } catch (error: any) {
        this.logger.error(
          `Failed to release stock for order #${order.orderNumber}: ${error.message}`,
        );
      }
    }

    this.logger.log(
      `Stock release complete: ${releasedCount}/${expiredOrders.length} orders processed.`,
    );
  }
}
