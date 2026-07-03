import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../features/cart-wishlist/services/cart.service';
import { WishlistService } from '../../../features/cart-wishlist/services/wishlist.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  readonly authService = inject(AuthService);
  readonly cartService = inject(CartService);
  readonly wishlistService = inject(WishlistService);
  private readonly router = inject(Router);

  // Component UI State
  readonly isMobileMenuOpen = signal<boolean>(false);
  readonly isProfileDropdownOpen = signal<boolean>(false);
  readonly searchQuery = signal<string>('');
  readonly quickLinks = [
    { label: 'Inicio', path: '/', exact: true },
    { label: 'Catálogo', path: '/productos' },
    { label: 'Wishlist', path: '/wishlist' }
  ];

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }

  toggleProfileDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isProfileDropdownOpen.update(v => !v);
  }

  closeDropdowns(): void {
    this.isProfileDropdownOpen.set(false);
    this.isMobileMenuOpen.set(false);
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  onSearchSubmit(event: Event): void {
    event.preventDefault();
    const query = this.searchQuery().trim();
    this.router.navigate(['/productos'], { queryParams: { search: query || null } });
    this.isMobileMenuOpen.set(false);
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.closeDropdowns();
        this.router.navigate(['/login']);
      }
    });
  }

  get initials(): string {
    const user = this.authService.currentUser();
    if (!user) return 'U';
    const first = user.firstName?.charAt(0) ?? '';
    const last = user.lastName?.charAt(0) ?? '';
    return `${first}${last}`.trim() || 'U';
  }
}
