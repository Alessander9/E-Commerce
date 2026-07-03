import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Order } from '../../../../shared/models/order.model';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css'
})
export class AdminOrdersComponent implements OnInit {
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
  showStatusModal = false;
  statusForm!: FormGroup;

  availableStatuses = [
    { value: 'PENDING', label: 'Pendiente de Pago' },
    { value: 'PAID', label: 'Pagado / Confirmado' },
    { value: 'SHIPPED', label: 'Enviado' },
    { value: 'DELIVERED', label: 'Entregado' },
    { value: 'CANCELLED', label: 'Cancelado' }
  ];

  ngOnInit(): void {
    this.initForm();
    setTimeout(() => this.loadOrders(), 0);
  }

  initForm(): void {
    this.statusForm = this.fb.group({
      status: ['', Validators.required],
      note: ['']
    });
  }

  loadOrders(page: number = 0): void {
    this.isLoading = true;
    this.loadError = null;
    this.cdr.detectChanges();
    this.adminService.getOrders(page, 10).subscribe({
      next: (res) => {
        if (res.data) {
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

  toggleExpand(order: Order): void {
    if (this.selectedOrder && this.selectedOrder.id === order.id) {
      this.selectedOrder = null;
    } else {
      this.selectedOrder = order;
    }
  }

  openStatusModal(order: Order, event: Event): void {
    event.stopPropagation(); // Avoid expanding/collapsing row when clicking button
    this.selectedOrder = order;
    this.statusForm.patchValue({
      status: order.status,
      note: ''
    });
    this.showStatusModal = true;
  }

  closeStatusModal(): void {
    this.showStatusModal = false;
    this.selectedOrder = null;
  }

  getStatusLabel(status: string): string {
    const s = this.availableStatuses.find(item => item.value === status);
    return s ? s.label : status;
  }

  onSubmitStatus(): void {
    if (this.statusForm.invalid || !this.selectedOrder) return;
    const { status, note } = this.statusForm.value;
    
    this.adminService.updateOrderStatus(this.selectedOrder.id, status, note).subscribe({
      next: () => {
        this.closeStatusModal();
        this.loadOrders(this.currentPage);
      }
    });
  }
}
