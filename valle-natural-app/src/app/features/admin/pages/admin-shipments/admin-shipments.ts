import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Order } from '../../../../shared/models/order.model';
import { Shipment } from '../../../../shared/models/shipping.model';

@Component({
  selector: 'app-admin-shipments',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-shipments.html',
  styleUrl: './admin-shipments.css'
})
export class AdminShipmentsComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  orders: Order[] = [];
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  isLoading = false;
  loadError: string | null = null;

  selectedOrder: Order | null = null;
  selectedShipment: Shipment | null = null;
  isLoadingShipment = false;

  // Dispatch Form / Modal
  showDispatchModal = false;
  dispatchForm!: FormGroup;

  // Add Tracking Event Form / Modal
  showTrackingModal = false;
  trackingForm!: FormGroup;

  trackingStatuses = [
    { value: 'PENDING', label: 'Registrado / Pendiente' },
    { value: 'IN_TRANSIT', label: 'En Tránsito' },
    { value: 'RECEIVED_OFFICE', label: 'Recibido en Agencia (Shalom)' },
    { value: 'READY_FOR_PICKUP', label: 'Listo para Retiro' },
    { value: 'DELIVERED', label: 'Entregado' }
  ];

  ngOnInit(): void {
    this.initForms();
    setTimeout(() => this.loadOrders(), 0);
  }

  initForms(): void {
    this.dispatchForm = this.fb.group({
      courier: ['CHAZKI', Validators.required],
      deliveryService: ['REGULAR', Validators.required],
      trackingCode: ['']
    });

    this.trackingForm = this.fb.group({
      status: ['IN_TRANSIT', Validators.required],
      location: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  loadOrders(page: number = 0): void {
    this.isLoading = true;
    this.loadError = null;
    this.cdr.detectChanges();
    this.adminService.getOrders(page, 10).subscribe({
      next: (res) => {
        if (res.data) {
          // Shipments only apply to PAID, SHIPPED, DELIVERED. We filter or list them.
          this.orders = res.data.content;
          this.totalPages = res.data.totalPages;
          this.currentPage = res.data.number;
          this.totalElements = res.data.totalElements;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.loadError = 'No se pudieron cargar los pedidos. Verifica tu sesión.';
        this.cdr.detectChanges();
      }
    });
  }

  onPageChange(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.loadOrders(page);
    }
  }

  onSelectOrder(order: Order): void {
    this.selectedOrder = order;
    this.selectedShipment = null;
    this.isLoadingShipment = true;

    this.adminService.getShipmentByOrderId(order.id).subscribe({
      next: (res) => {
        if (res.data) {
          this.selectedShipment = res.data;
        }
        this.isLoadingShipment = false;
      },
      error: () => {
        this.selectedShipment = null; // No shipment created yet
        this.isLoadingShipment = false;
      }
    });
  }

  openDispatchModal(): void {
    if (!this.selectedOrder) return;
    this.dispatchForm.reset({
      courier: 'CHAZKI',
      deliveryService: 'REGULAR',
      trackingCode: ''
    });
    this.showDispatchModal = true;
  }

  closeDispatchModal(): void {
    this.showDispatchModal = false;
  }

  onDispatchSubmit(): void {
    if (this.dispatchForm.invalid || !this.selectedOrder) {
      this.dispatchForm.markAllAsTouched();
      return;
    }
    const { courier, deliveryService, trackingCode } = this.dispatchForm.value;
    this.adminService.createShipment(this.selectedOrder.id, courier, deliveryService, trackingCode || undefined).subscribe({
      next: (res) => {
        if (res.data) {
          this.selectedShipment = res.data;
          // Also let's update order status to SHIPPED if it was PAID
          if (this.selectedOrder && this.selectedOrder.status === 'PAID') {
            this.adminService.updateOrderStatus(this.selectedOrder.id, 'SHIPPED', 'Envío registrado en Chazki (' + deliveryService + ')').subscribe({
              next: () => {
                this.loadOrders(this.currentPage);
              }
            });
          }
        }
        this.closeDispatchModal();
      }
    });
  }

  openTrackingModal(): void {
    if (!this.selectedShipment) return;
    this.trackingForm.reset({
      status: 'IN_TRANSIT',
      location: '',
      description: ''
    });
    this.showTrackingModal = true;
  }

  closeTrackingModal(): void {
    this.showTrackingModal = false;
  }

  onTrackingSubmit(): void {
    if (this.trackingForm.invalid || !this.selectedShipment || !this.selectedOrder) {
      this.trackingForm.markAllAsTouched();
      return;
    }
    const { status, location, description } = this.trackingForm.value;
    this.adminService.addTrackingEvent(this.selectedShipment.id, status, description, location).subscribe({
      next: () => {
        // Refresh shipment and order status if delivered
        if (status === 'DELIVERED') {
          this.adminService.updateOrderStatus(this.selectedOrder!.id, 'DELIVERED', 'Pedido entregado en destino final').subscribe({
            next: () => {
              this.loadOrders(this.currentPage);
            }
          });
        }
        
        // Refresh selected shipment
        if (this.selectedOrder) {
          this.onSelectOrder(this.selectedOrder);
        }
        this.closeTrackingModal();
      }
    });
  }

  getShipmentStatusLabel(status?: string): string {
    if (!status) return '-';
    const s = this.trackingStatuses.find(item => item.value === status);
    return s ? s.label : status;
  }
}
