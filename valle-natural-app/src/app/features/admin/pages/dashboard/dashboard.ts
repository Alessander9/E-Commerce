import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { AdminService } from '../../services/admin.service';
import { CatalogService } from '../../../catalog/services/catalog.service';
import { Order } from '../../../../shared/models/order.model';
import { forkJoin, of } from 'rxjs';
import { catchError, filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  readonly authService = inject(AuthService);
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly adminService = inject(AdminService);
  private readonly catalogService = inject(CatalogService);
  private readonly cdr = inject(ChangeDetectorRef);

  totalSales = 0;
  totalOrders = 0;
  pendingOrdersCount = 0;
  totalClients = 0;
  activeCouponsCount = 0;
  totalProducts = 0;
  recentOrders: Order[] = [];
  isLoading = false;
  isSidebarCollapsed = false;
  loadError: string | null = null;

  get isRootAdmin(): boolean {
    return this.route.firstChild === null;
  }

  ngOnInit(): void {
    console.log('[Dashboard] Initialized, isRootAdmin:', this.isRootAdmin);
    if (this.isRootAdmin) {
      this.loadDashboardData();
    }

    // Listen to router navigation to refresh data when returning to /admin
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      console.log('[Dashboard] NavigationEnd detected, isRootAdmin:', this.isRootAdmin);
      if (this.isRootAdmin) {
        this.loadDashboardData();
      }
    });
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  loadDashboardData(): void {
    if (this.isLoading) {
      console.log('[Dashboard] Already loading, skipping duplicate call.');
      return;
    }
    console.log('[Dashboard] Starting to load metrics...');
    this.isLoading = true;
    this.loadError = null;
    this.cdr.detectChanges();
    
    forkJoin({
      ordersRes: this.adminService.getOrders(0, 100).pipe(
        catchError((err) => {
          console.error('[Dashboard] Error loading orders:', err);
          this.loadError = 'Error al conectar con los servicios de administración.';
          return of({ data: { content: [], totalElements: 0 } });
        })
      ),
      couponsRes: this.adminService.getCoupons().pipe(
        catchError((err) => {
          console.error('[Dashboard] Error loading coupons:', err);
          return of({ data: [] });
        })
      ),
      usersRes: this.adminService.getUsers().pipe(
        catchError((err) => {
          console.error('[Dashboard] Error loading users:', err);
          return of({ data: [] });
        })
      ),
      productsRes: this.catalogService.getProducts(undefined, undefined, 0, 1).pipe(
        catchError((err) => {
          console.error('[Dashboard] Error loading products count:', err);
          return of({ data: { totalElements: 0 } });
        })
      )
    }).subscribe({
      next: ({ ordersRes, couponsRes, usersRes, productsRes }) => {
        console.log('[Dashboard] Data response received', { ordersRes, couponsRes, usersRes, productsRes });
        try {
          const orders = ordersRes.data?.content || [];
          this.totalOrders = ordersRes.data?.totalElements || 0;
          
          let salesSum = 0;
          let pendingCount = 0;
          
          orders.forEach(order => {
            if (order) {
              if (order.status !== 'CANCELLED') {
                salesSum += order.total || 0;
              }
              if (order.status === 'PENDING') {
                pendingCount++;
              }
            }
          });
          
          this.totalSales = salesSum;
          this.pendingOrdersCount = pendingCount;
          this.recentOrders = orders.slice(0, 5);
          
          const users = usersRes.data || [];
          this.totalClients = users.filter(u => u && u.roles && u.roles.includes('CLIENT')).length;
          if (this.totalClients === 0 && users.length > 0) {
            this.totalClients = users.filter(u => u && u.roles && !u.roles.includes('ADMIN')).length || users.length;
          }

          const coupons = couponsRes.data || [];
          this.activeCouponsCount = coupons.filter(c => c && c.active).length;

          this.totalProducts = productsRes.data?.totalElements || 0;
        } catch (e) {
          console.error('[Dashboard] Error processing received metrics:', e);
          this.loadError = 'Error al procesar las métricas de la base de datos.';
        } finally {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('[Dashboard] forkJoin outer error:', err);
        this.loadError = 'Error de conexión general con el backend.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getStatusLabel(status: string): string {
    const statuses: { [key: string]: string } = {
      'PENDING': 'Pendiente de Pago',
      'PAID': 'Pagado / Confirmado',
      'SHIPPED': 'Enviado',
      'DELIVERED': 'Entregado',
      'CANCELLED': 'Cancelado'
    };
    return statuses[status] || status;
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      }
    });
  }
}
