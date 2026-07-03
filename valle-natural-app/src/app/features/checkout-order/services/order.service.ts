import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../core/services/auth.service';
import { Order, OrderSummary } from '../../../shared/models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/v1/orders';

  createOrder(addressId: number, couponCode?: string): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(this.apiUrl, { addressId, couponCode });
  }

  getOrders(): Observable<ApiResponse<OrderSummary[]>> {
    return this.http.get<ApiResponse<OrderSummary[]>>(this.apiUrl);
  }

  getOrderDetails(orderNumber: string): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.apiUrl}/${orderNumber}`);
  }

  getOrderTracking(orderNumber: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/${orderNumber}/tracking`);
  }
}
