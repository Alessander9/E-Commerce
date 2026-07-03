import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Address } from '../../shared/models/user.model';
import { ApiResponse } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/v1/users/me';

  getAddresses(): Observable<ApiResponse<Address[]>> {
    return this.http.get<ApiResponse<Address[]>>(`${this.apiUrl}/addresses`);
  }

  addAddress(address: any): Observable<ApiResponse<Address>> {
    return this.http.post<ApiResponse<Address>>(`${this.apiUrl}/addresses`, address);
  }
}
