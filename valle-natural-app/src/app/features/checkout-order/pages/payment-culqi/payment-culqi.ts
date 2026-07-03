import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { PaymentService } from '../../services/payment.service';
import { Order } from '../../../../shared/models/order.model';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-payment-culqi',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './payment-culqi.html',
  styleUrl: './payment-culqi.css'
})
export class PaymentCulqiComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);
  private readonly paymentService = inject(PaymentService);
  private readonly document = inject(DOCUMENT);

  // States
  readonly order = signal<Order | null>(null);
  readonly isDataLoading = signal<boolean>(false);
  readonly isPaymentProcessing = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly paymentStatus = signal<'pending' | 'success' | 'failed'>('pending');

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const orderNumber = params.get('orderId'); // In our routes path: 'checkout/payment/:orderId'
      if (orderNumber) {
        this.loadOrderDetails(orderNumber);
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up global window bindings
    (window as any).culqi = null;
  }

  loadOrderDetails(orderNumber: string): void {
    this.isDataLoading.set(true);
    this.orderService.getOrderDetails(orderNumber).subscribe({
      next: (res) => {
      if (res.success && res.data) {
        this.order.set(res.data);
        if (res.data.status === 'PAID') {
          this.paymentStatus.set('success');
        }
        this.loadCulqiScript();
        this.initCulqi();
      } else {
        this.errorMessage.set('No pudimos cargar los detalles del pedido.');
      }
      this.isDataLoading.set(false);
      },
      error: () => {
        this.isDataLoading.set(false);
        this.paymentStatus.set('failed');
        this.errorMessage.set('No pudimos cargar el pedido. Vuelve al historial e intenta nuevamente.');
      }
    });
  }

  loadCulqiScript(): void {
    if (this.order() && (window as any).Culqi) {
      this.initCulqi();
      return;
    }

    if ((window as any).Culqi) {
      this.initCulqi();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.culqi.com/js/v4';
    script.async = true;
    script.onload = () => this.initCulqi();
    document.body.appendChild(script);
  }

  initCulqi(): void {
    const currentOrder = this.order();
    if (!currentOrder) return;

    const culqi = (window as any).Culqi;
    if (!culqi) return;

    const publicKey = this.document.querySelector('meta[name="culqi-public-key"]')?.getAttribute('content');
    if (!publicKey) {
      this.paymentStatus.set('failed');
      this.errorMessage.set('No se encontró la clave pública de Culqi en la configuración.');
      return;
    }

    // Set configuration matching Culqi v4 Checkout API
    culqi.publicKey = publicKey;
    culqi.settings({
      title: 'ALLMARA SUPERFOODS',
      currency: 'PEN',
      description: `Pago Pedido ${currentOrder.orderNumber}`,
      amount: Math.round(currentOrder.total * 100), // Culqi receives amount in cents
      order: currentOrder.orderNumber
    });
    culqi.options({
      lang: 'auto',
      installments: false
    });

    // Define global callback function expected by Culqi Checkout
    (window as any).culqi = () => {
      this.handleCulqiCallback();
    };
  }

  payWithCulqi(): void {
    const culqi = (window as any).Culqi;
    if (culqi) {
      this.isPaymentProcessing.set(true);
      culqi.open();
    } else {
      this.errorMessage.set('La pasarela de pago no está lista. Por favor, reintenta en unos segundos.');
    }
  }

  handleCulqiCallback(): void {
    const culqi = (window as any).Culqi;
    if (!culqi) return;

    if (culqi.token) {
      const token = culqi.token.id;
      // Close the modal
      try { culqi.close(); } catch (e) {}
      this.processPayment(token);
    } else if (culqi.error) {
      this.isPaymentProcessing.set(false);
      this.errorMessage.set(culqi.error.user_message || 'Error al ingresar los datos de la tarjeta.');
    }
  }

  processPayment(token: string): void {
    const currentOrder = this.order();
    if (!currentOrder) return;

    this.isPaymentProcessing.set(true);
    this.errorMessage.set(null);

    this.paymentService.processPayment(currentOrder.id, token).subscribe({
      next: (res) => {
        this.isPaymentProcessing.set(false);
        if (res.success && res.data && res.data.status === 'PAID') {
          this.paymentStatus.set('success');
          if (this.order()) {
            this.order.update(o => o ? { ...o, status: 'PAID' } : null);
          }
        } else {
          this.paymentStatus.set('failed');
          this.errorMessage.set('El pago fue rechazado. Revisa tu saldo o ingresa otra tarjeta.');
        }
      },
      error: (err) => {
        this.isPaymentProcessing.set(false);
        this.paymentStatus.set('failed');
        if (err.error && err.error.message) {
          this.errorMessage.set(err.error.message);
        } else {
          this.errorMessage.set('Ocurrió un error al procesar el pago. Por favor, reintenta.');
        }
      }
    });
  }
}
