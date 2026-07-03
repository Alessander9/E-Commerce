import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../core/services/auth.service';

export interface PaymentResponse {
  id: number;
  orderId: number;
  transactionId: string;
  amount: number;
  status: string;
  paidAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/v1/payments';

  processPayment(orderId: number, culqiToken: string): Observable<ApiResponse<PaymentResponse>> {
    return this.http.post<ApiResponse<PaymentResponse>>(this.apiUrl, { orderId, culqiToken });
  }
}
