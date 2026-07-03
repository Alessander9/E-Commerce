import { Component, Input, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ProductSummary } from '../../models/product.model';
import { CartService } from '../../../features/cart-wishlist/services/cart.service';
import { WishlistService } from '../../../features/cart-wishlist/services/wishlist.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css'
})
export class ProductCard {
  @Input({ required: true }) product!: ProductSummary;

  readonly cartService = inject(CartService);
  readonly wishlistService = inject(WishlistService);
  readonly quantityPulse = signal(false);

  // Checks
  isWishlisted(): boolean {
    return this.wishlistService.isInWishlist(this.product.id);
  }

  getCartQuantity(): number {
    return this.cartService.cart()?.items.find(item => item.productId === this.product.id)?.quantity ?? 0;
  }

  isInCart(): boolean {
    return this.getCartQuantity() > 0;
  }

  getProductBadge(): string {
    const name = this.product.name.toLowerCase();

    if (name.includes('miel') || name.includes('coco')) {
      return 'Oferta';
    }

    if (name.includes('maca') || name.includes('quinoa')) {
      return 'Top';
    }

    return 'Nuevo';
  }

  getProductHighlights(): string[] {
    const name = this.product.name.toLowerCase();

    if (name.includes('miel')) return ['Endulzante natural', 'Listo para envío'];
    if (name.includes('coco')) return ['Prensado en frío', 'Uso versátil'];
    if (name.includes('maca')) return ['Energía diaria', 'Sin aditivos'];
    if (name.includes('café')) return ['Tostado premium', 'Aroma intenso'];
    if (name.includes('quinoa')) return ['Fuente de proteína', 'Libre de gluten'];
    if (name.includes('polen')) return ['Vitalidad natural', 'Origen peruano'];

    return ['Natural', 'Compra asistida'];
  }

  // Actions
  onToggleWishlist(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.wishlistService.toggleProduct(this.product.id).subscribe();
  }

  private pulseQuantityState(): void {
    this.quantityPulse.set(false);
    requestAnimationFrame(() => {
      this.quantityPulse.set(true);
      window.setTimeout(() => this.quantityPulse.set(false), 220);
    });
  }

  onAddToCart(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    const currentQuantity = this.getCartQuantity();

    if (currentQuantity > 0) {
      this.onIncreaseQuantity(event);
      return;
    }

    this.cartService.addItem(this.product.id, this.product.name, this.product.price, 1).subscribe({
      next: () => this.pulseQuantityState()
    });
  }

  onIncreaseQuantity(event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    const nextQuantity = this.getCartQuantity() + 1;

    if (nextQuantity <= 1) {
      this.cartService.addItem(this.product.id, this.product.name, this.product.price, 1).subscribe({
        next: () => this.pulseQuantityState()
      });
      return;
    }

    this.cartService.updateItemQuantity(this.product.id, nextQuantity).subscribe({
      next: () => this.pulseQuantityState()
    });
  }

  onDecreaseQuantity(event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    const nextQuantity = this.getCartQuantity() - 1;

    if (nextQuantity <= 0) {
      this.cartService.removeItem(this.product.id).subscribe({
        next: () => this.pulseQuantityState()
      });
      return;
    }

    this.cartService.updateItemQuantity(this.product.id, nextQuantity).subscribe({
      next: () => this.pulseQuantityState()
    });
  }
}
