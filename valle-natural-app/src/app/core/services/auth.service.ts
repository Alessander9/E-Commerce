import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of, map, catchError, switchMap } from 'rxjs';
import { AuthResponse, UserProfile } from '../../shared/models/user.model';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/v1';

  // State initialized with local storage cache to prevent flickering
  readonly currentUser = signal<UserProfile | null>(this.getLocalProfile());
  readonly isLoading = signal<boolean>(false);

  constructor() {
    // Silently validate session against backend on startup
    this.loadProfile().subscribe({
      error: () => this.clearSession()
    });
  }

  login(request: any): Observable<ApiResponse<AuthResponse>> {
    this.isLoading.set(true);
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/auth/login`, request).pipe(
      switchMap(response => {
        if (response.success) {
          return this.loadProfile().pipe(
            map(() => response)
          );
        }
        return of(response);
      }),
      tap(() => this.isLoading.set(false)),
      catchError(err => {
        this.isLoading.set(false);
        throw err;
      })
    );
  }

  register(request: any): Observable<ApiResponse<AuthResponse>> {
    this.isLoading.set(true);
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/auth/register`, request).pipe(
      switchMap(response => {
        if (response.success) {
          return this.loadProfile().pipe(
            map(() => response)
          );
        }
        return of(response);
      }),
      tap(() => this.isLoading.set(false)),
      catchError(err => {
        this.isLoading.set(false);
        throw err;
      })
    );
  }

  refreshToken(): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/auth/refresh`, {}).pipe(
      catchError(err => {
        this.clearSession();
        throw err;
      })
    );
  }

  logout(): Observable<any> {
    this.clearSession();
    return this.http.post(`${this.apiUrl}/auth/logout`, {}).pipe(
      catchError(() => of(null)) // Ignore error on logout
    );
  }

  loadProfile(): Observable<UserProfile> {
    return this.http.get<ApiResponse<UserProfile>>(`${this.apiUrl}/users/me`).pipe(
      map(res => {
        const profile = res.data;
        this.currentUser.set(profile);
        localStorage.setItem('userProfile', JSON.stringify(profile));
        return profile;
      })
    );
  }

  // Get token methods kept as stubs to avoid breaking compilation in any other file
  getAccessToken(): string | null {
    return this.isAuthenticated() ? 'dummy_cookie_token' : null;
  }

  getRefreshToken(): string | null {
    return this.isAuthenticated() ? 'dummy_cookie_token' : null;
  }

  private getLocalProfile(): UserProfile | null {
    try {
      const data = localStorage.getItem('userProfile');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private clearSession(): void {
    localStorage.removeItem('userProfile');
    this.currentUser.set(null);
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  isAdmin(): boolean {
    const user = this.currentUser();
    if (user && Array.isArray(user.roles)) {
      return user.roles.includes('ADMIN') || user.roles.includes('ROLE_ADMIN');
    }
    return false;
  }
}
