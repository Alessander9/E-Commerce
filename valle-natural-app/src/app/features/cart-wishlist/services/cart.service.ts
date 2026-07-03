import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of, catchError, switchMap, forkJoin } from 'rxjs';
import { Cart, CartItem } from '../../../shared/models/cart.model';
import { AuthService, ApiResponse } from '../../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = 'http://localhost:8080/api/v1/cart';

  // Signals
  readonly cart = signal<Cart | null>(null);
  
  readonly cartCount = computed(() => {
    const currentCart = this.cart();
    if (!currentCart || !currentCart.items) return 0;
    return currentCart.items.reduce((acc, item) => acc + item.quantity, 0);
  });

  readonly cartTotal = computed(() => {
    const currentCart = this.cart();
    if (!currentCart) return 0;
    return currentCart.total || 0;
  });

  constructor() {
    // Reactively monitor authentication state and synchronize or load the cart
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.loadCart().subscribe();
      } else {
        this.loadLocalCart();
      }
    }, { allowSignalWrites: true });
  }

  private getLocalCartData(): Cart | null {
    const local = localStorage.getItem('local_cart');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  private syncLocalCartToBackend(items: CartItem[]): Observable<any[]> {
    const requests = items.map(item => 
      this.http.post<ApiResponse<Cart>>(`${this.apiUrl}/items`, { 
        productId: item.productId, 
        quantity: item.quantity 
      })
    );
    return forkJoin(requests);
  }

  loadCart(): Observable<ApiResponse<Cart>> {
    if (!this.authService.isAuthenticated()) {
      this.loadLocalCart();
      return of({ success: true, message: 'Loaded local cart', data: this.cart()!, timestamp: '' });
    }

    return this.http.get<ApiResponse<Cart>>(this.apiUrl).pipe(
      switchMap(res => {
        if (res.success) {
          const backendCart = res.data;
          const localCart = this.getLocalCartData();

          // Sync local items to backend if they exist
          if (localCart && localCart.items && localCart.items.length > 0) {
            return this.syncLocalCartToBackend(localCart.items).pipe(
              switchMap(() => {
                // Clear local cart to avoid repeat synchronization
                localStorage.removeItem('local_cart');
                // Reload final cart from backend
                return this.http.get<ApiResponse<Cart>>(this.apiUrl);
              }),
              tap(syncRes => {
                if (syncRes.success) {
                  this.cart.set(syncRes.data);
                  this.saveLocalCart(syncRes.data);
                }
              })
            );
          }

          this.cart.set(backendCart);
          this.saveLocalCart(backendCart);
          return of(res);
        }
        return of(res);
      }),
      catchError(err => {
        this.loadLocalCart();
        throw err;
      })
    );
  }

  addItem(productId: number, productName: string, unitPrice: number, quantity: number = 1): Observable<any> {
    if (!this.authService.isAuthenticated()) {
      this.addLocalItem(productId, productName, unitPrice, quantity);
      return of(this.cart());
    }

    return this.http.post<ApiResponse<Cart>>(`${this.apiUrl}/items`, { productId, quantity }).pipe(
      tap(res => {
        if (res.success) {
          this.cart.set(res.data);
          this.saveLocalCart(res.data);
        }
      })
    );
  }

  updateItemQuantity(productId: number, quantity: number): Observable<any> {
    if (quantity <= 0) {
      return this.removeItem(productId);
    }

    if (!this.authService.isAuthenticated()) {
      this.updateLocalQuantity(productId, quantity);
      return of(this.cart());
    }

    return this.http.patch<ApiResponse<Cart>>(`${this.apiUrl}/items/${productId}`, null, {
      params: { quantity: quantity.toString() }
    }).pipe(
      tap(res => {
        if (res.success) {
          this.cart.set(res.data);
          this.saveLocalCart(res.data);
        }
      })
    );
  }

  removeItem(productId: number): Observable<any> {
    if (!this.authService.isAuthenticated()) {
      this.removeLocalItem(productId);
      return of(this.cart());
    }

    // The backend doesn't have a specific DELETE /cart/items/{productId} in CartController,
    // but we can set quantity to 0 using updateItem (which service removes it if quantity <= 0)
    return this.updateItemQuantity(productId, 0);
  }

  clearCart(): Observable<any> {
    this.clearLocalCart();
    if (!this.authService.isAuthenticated()) {
      return of(null);
    }

    return this.http.delete(this.apiUrl).pipe(
      tap(() => {
        this.cart.set({ id: 0, items: [], total: 0 });
      })
    );
  }

  // Local Storage Fallbacks
  private loadLocalCart(): void {
    const local = localStorage.getItem('local_cart');
    if (local) {
      try {
        this.cart.set(JSON.parse(local));
      } catch (e) {
        this.clearLocalCart();
      }
    } else {
      this.cart.set({ id: 0, items: [], total: 0 });
    }
  }

  private saveLocalCart(cartData: Cart): void {
    localStorage.setItem('local_cart', JSON.stringify(cartData));
  }

  private clearLocalCart(): void {
    localStorage.removeItem('local_cart');
    this.cart.set({ id: 0, items: [], total: 0 });
  }

  private addLocalItem(productId: number, productName: string, unitPrice: number, quantity: number): void {
    const current = this.cart() || { id: 0, items: [], total: 0 };
    const items = [...current.items];
    const existing = items.find(i => i.productId === productId);

    if (existing) {
      existing.quantity += quantity;
      existing.subtotal = existing.quantity * existing.unitPrice;
    } else {
      items.push({
        productId,
        productName,
        quantity,
        unitPrice,
        subtotal: quantity * unitPrice
      });
    }

    const total = items.reduce((acc, item) => acc + item.subtotal, 0);
    const updated = { ...current, items, total };
    this.cart.set(updated);
    this.saveLocalCart(updated);
  }

  private updateLocalQuantity(productId: number, quantity: number): void {
    const current = this.cart() || { id: 0, items: [], total: 0 };
    const items = current.items.map(item => {
      if (item.productId === productId) {
        return {
          ...item,
          quantity,
          subtotal: quantity * item.unitPrice
        };
      }
      return item;
    });

    const total = items.reduce((acc, item) => acc + item.subtotal, 0);
    const updated = { ...current, items, total };
    this.cart.set(updated);
    this.saveLocalCart(updated);
  }

  private removeLocalItem(productId: number): void {
    const current = this.cart() || { id: 0, items: [], total: 0 };
    const items = current.items.filter(item => item.productId !== productId);
    const total = items.reduce((acc, item) => acc + item.subtotal, 0);
    const updated = { ...current, items, total };
    this.cart.set(updated);
    this.saveLocalCart(updated);
  }
}
