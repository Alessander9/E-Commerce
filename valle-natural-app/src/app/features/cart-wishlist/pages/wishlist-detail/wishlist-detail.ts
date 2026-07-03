import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../services/wishlist.service';
import { CatalogService } from '../../../catalog/services/catalog.service';
import { ProductSummary } from '../../../../shared/models/product.model';
import { ProductCard } from '../../../../shared/components/product-card/product-card';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-wishlist-detail',
  standalone: true,
  imports: [RouterLink, ProductCard],
  templateUrl: './wishlist-detail.html',
  styleUrl: './wishlist-detail.css'
})
export class WishlistDetailComponent implements OnInit {
  readonly wishlistService = inject(WishlistService);
  private readonly catalogService = inject(CatalogService);

  readonly products = signal<ProductSummary[]>([]);
  readonly isDataLoading = signal<boolean>(false);

  // Mock items to fall back to if backend is offline and we have items in our local wishlist
  private readonly fallbackProducts: ProductSummary[] = [
    {
      id: 1,
      name: 'Miel de Abeja Orgánica de Oxapampa',
      slug: 'miel-de-abeja-organica-oxapampa',
      sku: 'PROD-MIEL-01',
      price: 32.50,
      primaryImageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: 2,
      name: 'Aceite de Coco Prensado en Frío',
      slug: 'aceite-de-coco-prensado-frio',
      sku: 'PROD-COCO-02',
      price: 45.00,
      primaryImageUrl: 'https://images.unsplash.com/photo-1543224494-a624d36f9f3c?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: 3,
      name: 'Harina de Maca Gelatinizada Negra',
      slug: 'maca-negra-gelatinizada',
      sku: 'PROD-MACA-03',
      price: 28.00,
      primaryImageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=400'
    }
  ];

  ngOnInit(): void {
    this.loadWishlistDetails();
  }

  loadWishlistDetails(): void {
    const favoriteIds = this.wishlistService.wishlistProductIds();
    if (favoriteIds.size === 0) {
      this.products.set([]);
      return;
    }

    this.isDataLoading.set(true);
    // Fetch products and filter those that are favorited
    this.catalogService.getProducts(undefined, undefined, 0, 100).pipe(
      catchError(() => {
        // Fallback filter
        const filtered = this.fallbackProducts.filter(p => favoriteIds.has(p.id));
        return of({ success: true, data: { content: filtered } });
      })
    ).subscribe(res => {
      if (res.success && res.data && res.data.content) {
        const filtered = res.data.content.filter((p: any) => favoriteIds.has(p.id));
        this.products.set(filtered);
      }
      this.isDataLoading.set(false);
    });
  }
}
