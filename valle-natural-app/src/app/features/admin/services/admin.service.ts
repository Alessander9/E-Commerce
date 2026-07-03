import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../core/services/auth.service';
import { PageResponse } from '../../catalog/services/catalog.service';
import { Product, ProductSummary, Category } from '../../../shared/models/product.model';
import { Order } from '../../../shared/models/order.model';
import { Shipment } from '../../../shared/models/shipping.model';

export interface Coupon {
  id?: number;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  usedCount?: number;
  startDate: string;
  endDate: string;
  active: boolean;
}

export interface UserAdmin {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  active: boolean;
  roles: string[];
}

export interface AuditLog {
  id: number;
  userId?: number;
  action: string;
  entityName: string;
  entityId?: number;
  previousState?: any;
  newState?: any;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/v1/admin';

  // Products
  createProduct(product: any): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(`${this.apiUrl}/products`, product);
  }

  updateProduct(id: number, product: any): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/products/${id}`, product);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/products/${id}`);
  }

  updateInventory(id: number, availableStock: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.apiUrl}/products/${id}/inventory`, { availableStock });
  }

  addPrice(id: number, price: number): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/products/${id}/prices`, { price });
  }

  // Categories
  createCategory(category: any): Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>>(`${this.apiUrl}/categories`, category);
  }

  updateCategory(id: number, category: any): Observable<ApiResponse<Category>> {
    return this.http.put<ApiResponse<Category>>(`${this.apiUrl}/categories/${id}`, category);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categories/${id}`);
  }

  // Orders
  getOrders(page: number = 0, size: number = 10): Observable<ApiResponse<PageResponse<Order>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<PageResponse<Order>>>(`${this.apiUrl}/orders`, { params });
  }

  updateOrderStatus(orderId: number, status: string, note?: string): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.apiUrl}/orders/${orderId}/status`, { status, note });
  }

  // Shipments
  createShipment(orderId: number, courier: string = 'CHAZKI', deliveryService: string = 'REGULAR', trackingCode?: string): Observable<ApiResponse<Shipment>> {
    let params = new HttpParams()
      .set('courier', courier)
      .set('deliveryService', deliveryService);
    if (trackingCode) {
      params = params.set('trackingCode', trackingCode);
    }
    return this.http.post<ApiResponse<Shipment>>(`${this.apiUrl}/shipments/${orderId}`, null, { params });
  }

  getShipmentByOrderId(orderId: number): Observable<ApiResponse<Shipment>> {
    return this.http.get<ApiResponse<Shipment>>(`${this.apiUrl}/shipments/order/${orderId}`);
  }

  addTrackingEvent(shipmentId: number, status: string, description: string, location?: string): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.apiUrl}/shipments/${shipmentId}/tracking`, { status, description, location });
  }

  // Coupons
  getCoupons(): Observable<ApiResponse<Coupon[]>> {
    return this.http.get<ApiResponse<Coupon[]>>(`${this.apiUrl}/coupons`);
  }

  createCoupon(coupon: Coupon): Observable<ApiResponse<Coupon>> {
    return this.http.post<ApiResponse<Coupon>>(`${this.apiUrl}/coupons`, coupon);
  }

  updateCoupon(id: number, coupon: Coupon): Observable<ApiResponse<Coupon>> {
    return this.http.patch<ApiResponse<Coupon>>(`${this.apiUrl}/coupons/${id}`, coupon);
  }

  // Users
  getUsers(): Observable<ApiResponse<UserAdmin[]>> {
    return this.http.get<ApiResponse<UserAdmin[]>>(`${this.apiUrl}/users`);
  }

  toggleUserActive(id: number, active: boolean): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.apiUrl}/users/${id}/active`, null, {
      params: { active: active.toString() }
    });
  }

  // Audit Logs
  getAuditLogs(): Observable<ApiResponse<AuditLog[]>> {
    return this.http.get<ApiResponse<AuditLog[]>>(`${this.apiUrl}/audit-logs`);
  }
}
