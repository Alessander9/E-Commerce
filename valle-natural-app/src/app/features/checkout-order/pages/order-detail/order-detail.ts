import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order } from '../../../../shared/models/order.model';

export interface TrackingEvent {
  status: string;
  location: string;
  description: string;
  createdAt: string;
}

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.css'
})
export class OrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);

  order: Order | null = null;
  trackingEvents: TrackingEvent[] = [];
  isLoading = false;
  orderNumber = '';

  ngOnInit(): void {
    this.orderNumber = this.route.snapshot.paramMap.get('orderNumber') || '';
    if (this.orderNumber) {
      this.loadDetails();
    }
  }

  loadDetails(): void {
    this.isLoading = true;
    this.orderService.getOrderDetails(this.orderNumber).subscribe({
      next: (res) => {
        if (res.data) {
          this.order = res.data;
          this.loadTracking();
        } else {
          this.isLoading = false;
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  loadTracking(): void {
    this.orderService.getOrderTracking(this.orderNumber).subscribe({
      next: (res) => {
        if (res.data) {
          this.trackingEvents = res.data;
        }
        this.isLoading = false;
      },
      error: () => {
        // Safe to ignore if tracking is not created yet (PENDING payment)
        this.trackingEvents = [];
        this.isLoading = false;
      }
    });
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return 'Pendiente de Pago';
      case 'PAID': return 'Pagado / Confirmado';
      case 'SHIPPED': return 'Enviado';
      case 'DELIVERED': return 'Entregado';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  }

  getTrackingStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return 'Pedido Creado';
      case 'IN_TRANSIT': return 'En Tránsito';
      case 'RECEIVED_OFFICE': return 'Recibido en Agencia (Shalom)';
      case 'READY_FOR_PICKUP': return 'Listo para Retiro';
      case 'DELIVERED': return 'Entregado';
      default: return status;
    }
  }
}
