import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger('PaymentsService');

  constructor(private readonly prisma: PrismaService) {}

  async processPayment(
    tenantId: bigint,
    userId: bigint,
    data: {
      orderId: string;
      token?: string;
      provider?: string;
      paymentMethod?: string;
    },
  ) {
    const orderId = BigInt(data.orderId);
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { variant: { include: { inventory: true } } } },
      },
    });

    if (!order || order.tenantId !== tenantId) {
      throw new NotFoundException('Pedido no encontrado en esta tienda');
    }

    if (order.paymentStatus === 'PAID') {
      throw new BadRequestException('Este pedido ya se encuentra pagado');
    }

    return this.prisma.$transaction(async (tx) => {
      const transactionId = `TX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // 1. Create Payment Record
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          provider: data.provider || 'CULQI',
          transactionId,
          amount: order.total,
          currency: order.currency,
          status: 'PAID',
          paymentMethod: data.paymentMethod || 'CARD_VISA',
          paidAt: new Date(),
          metadata: {
            token: data.token || 'tok_test_culqi',
            processedAt: new Date().toISOString(),
          },
        },
      });

      // 2. Update Order Status
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          paymentStatus: 'PAID',
          fulfillmentStatus: 'PROCESSING',
        },
      });

      // 3. Status History
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          changedBy: userId,
          status: 'PAID',
          note: `Pago confirmado mediante ${data.provider || 'Culqi'}. Transacción: ${transactionId}`,
        },
      });

      // 4. Deduct Reserved Stock permanently
      for (const item of order.items) {
        if (item.variant && item.variant.inventory) {
          await tx.inventory.update({
            where: { id: item.variant.inventory.id },
            data: {
              reservedStock: { decrement: item.quantity },
            },
          });

          await tx.inventoryMovement.create({
            data: {
              tenantId,
              variantId: item.variantId,
              movementType: 'SALE',
              quantity: item.quantity,
              stockBefore: item.variant.inventory.availableStock + item.variant.inventory.reservedStock,
              stockAfter: item.variant.inventory.availableStock + item.variant.inventory.reservedStock - item.quantity,
              referenceType: 'PAYMENT_CONFIRMED',
              referenceId: order.id,
              note: `Venta formalizada por pago de pedido #${order.orderNumber}`,
            },
          });
        }
      }

      // 5. Update Shipment Tracking
      const shipment = await tx.shipment.findUnique({
        where: { orderId: order.id },
      });

      if (shipment) {
        await tx.shipment.update({
          where: { id: shipment.id },
          data: { status: 'PROCESSING' },
        });

        await tx.shipmentTracking.create({
          data: {
            shipmentId: shipment.id,
            status: 'PAGO_CONFIRMADO',
            description: 'Pago recibido. El almacén está preparando tu pedido.',
          },
        });
      }

      return payment;
    });
  }

  // ===================== WEBHOOK HANDLING =====================

  /**
   * Process an incoming Culqi webhook event.
   *
   * Flow:
   *   1. Validate webhook signature (HMAC-SHA256)
   *   2. Check idempotency (event already processed?)
   *   3. Store webhook in PAYMENT_WEBHOOKS
   *   4. Process event based on type
   *   5. Mark as processed
   */
  async handleCulqiWebhook(
    payload: any,
    signatureHeader: string | undefined,
  ): Promise<{ received: boolean }> {
    // 1. Validate signature
    if (signatureHeader) {
      const isValid = this.validateWebhookSignature(payload, signatureHeader);
      if (!isValid) {
        this.logger.warn('Invalid webhook signature received');
        throw new BadRequestException('Invalid webhook signature');
      }
    }

    const eventType = payload?.type;
    const eventId = payload?.data?.id;

    if (!eventType || !eventId) {
      throw new BadRequestException('Invalid webhook payload: missing type or data.id');
    }

    // 2. Check idempotency
    const existing = await this.prisma.paymentWebhook.findUnique({
      where: { eventId },
    });

    if (existing?.processed) {
      this.logger.log(`Webhook event ${eventId} already processed, skipping`);
      return { received: true };
    }

    // 3. Store webhook
    const webhook = await this.prisma.paymentWebhook.create({
      data: {
        provider: 'CULQI',
        eventId,
        eventType,
        payload: payload as any,
        status: 'RECEIVED',
      },
    });

    // 4. Process based on event type
    try {
      await this.processWebhookEvent(eventType, payload?.data);
      await this.prisma.paymentWebhook.update({
        where: { id: webhook.id },
        data: { processed: true, processedAt: new Date(), status: 'PROCESSED' },
      });
    } catch (error: any) {
      this.logger.error(`Failed to process webhook event ${eventType}: ${error.message}`);
      await this.prisma.paymentWebhook.update({
        where: { id: webhook.id },
        data: { status: 'FAILED' },
      });
    }

    return { received: true };
  }

  /**
   * Process individual webhook event types.
   */
  private async processWebhookEvent(eventType: string, data: any): Promise<void> {
    const transactionId = data?.metadata?.transaction_id || data?.transaction_id;

    if (!transactionId) {
      this.logger.warn(`No transaction_id found in webhook event ${eventType}`);
      return;
    }

    // Find the payment by transaction ID
    const payment = await this.prisma.payment.findFirst({
      where: { transactionId },
      include: {
        order: {
          include: {
            items: { include: { variant: { include: { inventory: true } } } },
          },
        },
      },
    });

    if (!payment) {
      this.logger.warn(`Payment not found for transaction ${transactionId}`);
      return;
    }

    switch (eventType) {
      case 'charge.succeeded':
        await this.handleChargeSucceeded(payment);
        break;

      case 'charge.failed':
        await this.handleChargeFailed(payment, data);
        break;

      case 'charge.created':
        // Just log, no action needed
        this.logger.log(`Charge created event for payment ${payment.id}`);
        break;

      default:
        this.logger.log(`Unhandled webhook event type: ${eventType}`);
    }
  }

  /**
   * Handle successful charge — confirm payment.
   */
  private async handleChargeSucceeded(payment: any): Promise<void> {
    if (payment.status === 'PAID') {
      return; // Already processed
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'PAID', paidAt: new Date() },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'PAID',
          paymentStatus: 'PAID',
          fulfillmentStatus: 'PROCESSING',
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: payment.orderId,
          status: 'PAID',
          note: `Pago confirmado vía webhook Culqi. Transacción: ${payment.transactionId}`,
        },
      });
    });
  }

  /**
   * Handle failed charge.
   */
  private async handleChargeFailed(payment: any, data: any): Promise<void> {
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'FAILED',
        failedAt: new Date(),
        metadata: {
          ...(payment.metadata as any || {}),
          failureReason: data?.failure_message || 'Charge failed',
        },
      },
    });

    await this.prisma.orderStatusHistory.create({
      data: {
        orderId: payment.orderId,
        status: 'PAYMENT_FAILED',
        note: `Pago fallido vía webhook Culqi: ${data?.failure_message || 'N/A'}`,
      },
    });
  }

  // ===================== WEBHOOK SIGNATURE VALIDATION =====================

  /**
   * Validate Culqi webhook signature using HMAC-SHA256.
   *
   * Culqi sends the signature in the header `x-culqi-signature`.
   * The signature is computed as: HMAC-SHA256(secret, request_body)
   */
  private validateWebhookSignature(payload: any, signatureHeader: string): boolean {
    const secret = process.env.CULQI_WEBHOOK_SECRET;
    if (!secret) {
      this.logger.warn('CULQI_WEBHOOK_SECRET not configured — skipping signature validation');
      return true; // Allow in development
    }

    try {
      const body = JSON.stringify(payload);
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signatureHeader),
        Buffer.from(expectedSignature),
      );
    } catch {
      return false;
    }
  }

  // ===================== REFUND SUPPORT =====================

  /**
   * Process a refund for a paid order.
   *
   * Flow:
   *   1. Validate order is refundable
   *   2. Create refund payment record
   *   3. Update order status to REFUNDED
   *   4. Reverse inventory (return stock)
   *   5. Update shipment tracking
   */
  async processRefund(
    tenantId: bigint,
    orderId: bigint,
    data: {
      reason?: string;
      amount?: number; // Partial refund support
    },
  ) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId },
      include: {
        items: { include: { variant: { include: { inventory: true } } } },
        payments: { where: { status: 'PAID' } },
        shipment: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }

    if (order.paymentStatus !== 'PAID') {
      throw new BadRequestException('Solo se pueden reembolsar pedidos pagados');
    }

    if (order.status === 'REFUNDED') {
      throw new BadRequestException('Este pedido ya fue reembolsado');
    }

    const refundAmount = data.amount || Number(order.total);

    if (refundAmount > Number(order.total)) {
      throw new BadRequestException(
        `El monto del reembolso (${refundAmount}) excede el total del pedido (${order.total})`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Create refund payment record
      const refundPayment = await tx.payment.create({
        data: {
          orderId: order.id,
          provider: 'CULQI',
          transactionId: `REF-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
          amount: refundAmount,
          currency: order.currency,
          status: 'PAID',
          paymentMethod: 'REFUND',
          paidAt: new Date(),
          metadata: {
            type: 'REFUND',
            reason: data.reason || 'Reembolso solicitado',
            originalPaymentId: order.payments[0]?.id?.toString(),
          },
        },
      });

      // 2. Update order status
      const isFullRefund = refundAmount >= Number(order.total);
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: isFullRefund ? 'REFUNDED' : order.status,
          paymentStatus: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
        },
      });

      // 3. Status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'REFUNDED',
          note: `Reembolso de S/ ${refundAmount}. ${data.reason || ''}`.trim(),
        },
      });

      // 4. Reverse inventory for full refunds
      if (isFullRefund) {
        for (const item of order.items) {
          if (item.variant?.inventory) {
            await tx.inventory.update({
              where: { id: item.variant.inventory.id },
              data: {
                availableStock: { increment: item.quantity },
              },
            });

            await tx.inventoryMovement.create({
              data: {
                tenantId,
                variantId: item.variantId,
                movementType: 'RETURN',
                quantity: item.quantity,
                stockBefore: item.variant.inventory.availableStock,
                stockAfter: item.variant.inventory.availableStock + item.quantity,
                referenceType: 'REFUND',
                referenceId: order.id,
                note: `Stock devuelto por reembolso del pedido #${order.orderNumber}`,
              },
            });
          }
        }
      }

      // 5. Update shipment tracking
      if (order.shipment) {
        await tx.shipmentTracking.create({
          data: {
            shipmentId: order.shipment.id,
            status: 'REEMBOLSADO',
            description: `Reembolso procesado. Monto: S/ ${refundAmount}`,
          },
        });
      }

      return {
        refund: {
          id: refundPayment.id.toString(),
          amount: refundAmount,
          status: 'PROCESSED',
          transactionId: refundPayment.transactionId,
        },
        order: {
          id: order.id.toString(),
          status: isFullRefund ? 'REFUNDED' : order.status,
          paymentStatus: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
        },
      };
    });
  }
}
