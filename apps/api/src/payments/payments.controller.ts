import {
  Controller,
  Post,
  Body,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { TenantGuard } from '../common/guards/tenant.guard';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Payments & Culqi')
@Controller('api')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // ===================== STOREFRONT — PROCESS PAYMENT =====================

  @Post('store/payments/process')
  @UseGuards(TenantGuard, AuthGuard)
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-tenant-slug', description: 'Slug del tenant', required: false })
  @ApiOperation({ summary: 'Procesar pago de un pedido mediante pasarela Culqi' })
  async processPayment(
    @CurrentTenant() tenant: any,
    @CurrentUser() user: any,
    @Body() body: any,
  ) {
    return this.paymentsService.processPayment(tenant.id, user.id, body);
  }

  // ===================== PUBLIC — CULQI WEBHOOK =====================

  @Post('payments/webhooks/culqi')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook público para recibir eventos asíncronos de Culqi' })
  @ApiHeader({ name: 'x-culqi-signature', description: 'Firma HMAC-SHA256 del webhook', required: false })
  async handleCulqiWebhook(
    @Body() payload: any,
    @Headers('x-culqi-signature') signature?: string,
  ) {
    return this.paymentsService.handleCulqiWebhook(payload, signature);
  }

  // ===================== ADMIN — REFUND =====================

  @Post('admin/orders/:orderId/refund')
  @UseGuards(TenantGuard, AuthGuard, RolesGuard)
  @Roles('TENANT_ADMIN')
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-tenant-slug', description: 'Slug del tenant', required: false })
  @ApiOperation({ summary: 'Procesar reembolso de un pedido pagado (total o parcial)' })
  async processRefund(
    @CurrentTenant() tenant: any,
    @CurrentUser() user: any,
    @Body() body: { orderId: string; reason?: string; amount?: number },
  ) {
    return this.paymentsService.processRefund(
      tenant.id,
      BigInt(body.orderId),
      { reason: body.reason, amount: body.amount },
    );
  }
}
