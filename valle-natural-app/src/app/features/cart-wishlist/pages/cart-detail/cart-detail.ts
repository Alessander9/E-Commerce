import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart-detail',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './cart-detail.html',
  styleUrl: './cart-detail.css'
})
export class CartDetailComponent {
  readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  onIncrementQuantity(productId: number, currentQuantity: number): void {
    this.cartService.updateItemQuantity(productId, currentQuantity + 1).subscribe();
  }

  onDecrementQuantity(productId: number, currentQuantity: number): void {
    if (currentQuantity > 1) {
      this.cartService.updateItemQuantity(productId, currentQuantity - 1).subscribe();
    } else {
      this.onRemoveItem(productId);
    }
  }

  onRemoveItem(productId: number): void {
    this.cartService.removeItem(productId).subscribe();
  }

  onClearCart(): void {
    if (confirm('¿Estás seguro de que deseas vaciar tu carrito?')) {
      this.cartService.clearCart().subscribe();
    }
  }

  onCheckout(): void {
    this.router.navigate(['/checkout']);
  }
}
