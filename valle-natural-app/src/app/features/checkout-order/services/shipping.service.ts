import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../core/services/auth.service';
import { ShippingZone } from '../../../shared/models/shipping.model';

@Injectable({
  providedIn: 'root'
})
export class ShippingService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/v1/shipping';

  getZones(): Observable<ApiResponse<ShippingZone[]>> {
    return this.http.get<ApiResponse<ShippingZone[]>>(`${this.apiUrl}/zones`);
  }

  calculateRate(addressId: number): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/rates/calculate`, { addressId });
  }
}
