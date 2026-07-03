import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of, catchError } from 'rxjs';
import { AuthService, ApiResponse } from '../../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = 'http://localhost:8080/api/v1/wishlist';

  // Signals
  readonly wishlistProductIds = signal<Set<number>>(new Set());

  readonly wishlistCount = computed(() => this.wishlistProductIds().size);

  constructor() {
    if (this.authService.isAuthenticated()) {
      this.loadWishlist().subscribe();
    } else {
      this.loadLocalWishlist();
    }
  }

  loadWishlist(): Observable<any> {
    if (!this.authService.isAuthenticated()) {
      this.loadLocalWishlist();
      return of(Array.from(this.wishlistProductIds()));
    }

    return this.http.get<ApiResponse<any>>(this.apiUrl).pipe(
      tap(res => {
        if (res.success && res.data) {
          const ids = new Set<number>(res.data.productIds || []);
          this.wishlistProductIds.set(ids);
          this.saveLocalWishlist(ids);
        }
      }),
      catchError(err => {
        this.loadLocalWishlist();
        throw err;
      })
    );
  }

  addProduct(productId: number): Observable<any> {
    if (!this.authService.isAuthenticated()) {
      const current = this.wishlistProductIds();
      current.add(productId);
      this.wishlistProductIds.set(new Set(current));
      this.saveLocalWishlist(current);
      return of(null);
    }

    return this.http.post(`${this.apiUrl}/items/${productId}`, {}).pipe(
      tap(() => {
        const current = this.wishlistProductIds();
        current.add(productId);
        this.wishlistProductIds.set(new Set(current));
        this.saveLocalWishlist(current);
      })
    );
  }

  removeProduct(productId: number): Observable<any> {
    if (!this.authService.isAuthenticated()) {
      const current = this.wishlistProductIds();
      current.delete(productId);
      this.wishlistProductIds.set(new Set(current));
      this.saveLocalWishlist(current);
      return of(null);
    }

    return this.http.delete(`${this.apiUrl}/items/${productId}`).pipe(
      tap(() => {
        const current = this.wishlistProductIds();
        current.delete(productId);
        this.wishlistProductIds.set(new Set(current));
        this.saveLocalWishlist(current);
      })
    );
  }

  toggleProduct(productId: number): Observable<any> {
    if (this.isInWishlist(productId)) {
      return this.removeProduct(productId);
    } else {
      return this.addProduct(productId);
    }
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistProductIds().has(productId);
  }

  // Local Storage
  private loadLocalWishlist(): void {
    const local = localStorage.getItem('local_wishlist');
    if (local) {
      try {
        const arr = JSON.parse(local);
        this.wishlistProductIds.set(new Set(arr));
      } catch (e) {
        this.wishlistProductIds.set(new Set());
      }
    } else {
      this.wishlistProductIds.set(new Set());
    }
  }

  private saveLocalWishlist(ids: Set<number>): void {
    localStorage.setItem('local_wishlist', JSON.stringify(Array.from(ids)));
  }
}
