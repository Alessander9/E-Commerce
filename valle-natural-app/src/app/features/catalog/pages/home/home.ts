import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { ProductCard } from '../../../../shared/components/product-card/product-card';
import { Category, ProductSummary } from '../../../../shared/models/product.model';
import { CatalogService } from '../../services/catalog.service';
import { chiaImage, mielImage, aceiteCocoImage, macaNegraImage, quinuaPopImage, pecanasImage, vitalidadImage } from './home-images';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ProductCard, DecimalPipe],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  private readonly catalogService = inject(CatalogService);
  private readonly localFeaturedImages = [
    mielImage,
    aceiteCocoImage,
    macaNegraImage,
    quinuaPopImage
  ];

  readonly categoryImages = {
    superfoods: chiaImage,
    miel: mielImage,
    frutosSecos: pecanasImage,
    bienestar: vitalidadImage
  };

  readonly featuredProducts = signal<ProductSummary[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly isLoading = signal<boolean>(false);

  readonly heroProduct = computed(() => this.featuredProducts()[0] ?? null);

  private readonly mockProducts: ProductSummary[] = [
    {
      id: 1,
      name: 'Miel de Abeja Orgánica de Oxapampa',
      slug: 'miel-de-abeja-organica-oxapampa',
      sku: 'PROD-MIEL-01',
      price: 32.5,
      primaryImageUrl: mielImage
    },
    {
      id: 2,
      name: 'Aceite de Coco Prensado en Frío',
      slug: 'aceite-de-coco-prensado-frio',
      sku: 'PROD-COCO-02',
      price: 45,
      primaryImageUrl: aceiteCocoImage
    },
    {
      id: 3,
      name: 'Harina de Maca Gelatinizada Negra',
      slug: 'maca-negra-gelatinizada',
      sku: 'PROD-MACA-03',
      price: 28,
      primaryImageUrl: macaNegraImage
    },
    {
      id: 4,
      name: 'Quinoa Real Orgánica Blanca',
      slug: 'quinoa-real-organica-blanca',
      sku: 'PROD-QUIN-05',
      price: 15.5,
      primaryImageUrl: quinuaPopImage
    }
  ];

  private readonly mockCategories: Category[] = [
    { id: 1, name: 'Superfoods', slug: 'superfoods', active: true },
    { id: 2, name: 'Miel y endulzantes', slug: 'miel-y-endulzantes', active: true },
    { id: 3, name: 'Frutos secos', slug: 'frutos-secos', active: true },
    { id: 4, name: 'Bienestar', slug: 'bienestar', active: true }
  ];

  ngOnInit(): void {
    this.loadFeaturedProducts();
    this.loadCategories();
  }

  loadFeaturedProducts(): void {
    this.isLoading.set(true);
    this.catalogService.getProducts(undefined, '', 0, 8).pipe(
      catchError(() => of({ success: true, data: { content: this.mockProducts } }))
    ).subscribe(res => {
      if (res.success && res.data?.content) {
        this.featuredProducts.set(
          res.data.content.slice(0, 4).map((product, index) => ({
            ...product,
            primaryImageUrl: this.localFeaturedImages[index % this.localFeaturedImages.length]
          }))
        );
      } else {
        this.featuredProducts.set(this.mockProducts);
      }
      this.isLoading.set(false);
    });
  }

  loadCategories(): void {
    this.catalogService.getCategories().pipe(
      catchError(() => of({ success: true, data: this.mockCategories }))
    ).subscribe(res => {
      if (res.success && res.data) {
        this.categories.set(res.data.slice(0, 4));
      } else {
        this.categories.set(this.mockCategories);
      }
    });
  }
}
