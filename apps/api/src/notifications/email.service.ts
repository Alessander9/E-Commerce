import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { welcomeEmail } from './templates/welcome.template';
import { orderConfirmationEmail } from './templates/order-confirmation.template';
import { shippingNotificationEmail } from './templates/shipping-notification.template';
import { passwordResetEmail } from './templates/password-reset.template';

@Injectable()
export class EmailService {
  private readonly logger = new Logger('EmailService');
  private transporter: nodemailer.Transporter;
  private readonly fromName: string;
  private readonly fromEmail: string;
  private readonly frontendUrl: string;

  constructor() {
    this.fromName = process.env.EMAIL_FROM_NAME || 'Cleo Platform';
    this.fromEmail = process.env.EMAIL_FROM_ADDRESS || 'noreply@cleoplatform.com';
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Configure nodemailer transport
    // In development, use ethereal or console transport
    // In production, configure with real SMTP or transactional email service
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      this.logger.log(`Email transport configured: ${smtpHost}:${smtpPort}`);
    } else {
      // Development: log emails to console
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
      this.logger.warn('No SMTP configured — emails will be logged to console');
    }
  }

  /**
   * Send a generic email.
   */
  private async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to,
        subject,
        html,
      });

      if (process.env.SMTP_HOST) {
        this.logger.log(`Email sent to ${to}: ${info.messageId}`);
      } else {
        // Development: log the email content
        this.logger.log(`📧 Email to: ${to}`);
        this.logger.log(`   Subject: ${subject}`);
        this.logger.log(`   Preview: ${(JSON.parse(info.message || '{}')?.html || '').substring(0, 200)}...`);
      }
    } catch (error: any) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      // Don't throw — email failures should not block business logic
    }
  }

  // ===================== TEMPLATED EMAILS =====================

  /**
   * Send welcome email after user registration.
   */
  async sendWelcomeEmail(to: string, data: {
    firstName: string;
    tenantName: string;
  }): Promise<void> {
    const html = welcomeEmail({
      ...data,
      loginUrl: `${this.frontendUrl}/login`,
    });

    await this.sendEmail(to, `¡Bienvenido/a a ${data.tenantName}!`, html);
  }

  /**
   * Send order confirmation email.
   */
  async sendOrderConfirmation(to: string, data: {
    firstName: string;
    orderNumber: string;
    items: Array<{ name: string; quantity: number; unitPrice: number }>;
    subtotal: number;
    shippingCost: number;
    discountAmount: number;
    total: number;
    currency: string;
    shippingAddress: string;
    tenantName: string;
  }): Promise<void> {
    const html = orderConfirmationEmail({
      ...data,
      orderUrl: `${this.frontendUrl}/mis-pedidos`,
    });

    await this.sendEmail(to, `Pedido ${data.orderNumber} confirmado ✅`, html);
  }

  /**
   * Send shipping notification email with tracking code.
   */
  async sendShippingNotification(to: string, data: {
    firstName: string;
    orderNumber: string;
    courier: string;
    trackingCode: string;
    trackingUrl?: string;
    tenantName: string;
  }): Promise<void> {
    const html = shippingNotificationEmail({
      ...data,
      ordersUrl: `${this.frontendUrl}/mis-pedidos`,
    });

    await this.sendEmail(to, `Pedido ${data.orderNumber} despachado 🚚`, html);
  }

  /**
   * Send password reset email.
   */
  async sendPasswordReset(to: string, data: {
    firstName: string;
    resetToken: string;
  }): Promise<void> {
    const html = passwordResetEmail({
      firstName: data.firstName,
      resetUrl: `${this.frontendUrl}/reset-password?token=${data.resetToken}`,
      expiresIn: '1 hora',
    });

    await this.sendEmail(to, 'Restablecer Contraseña 🔐', html);
  }
}
