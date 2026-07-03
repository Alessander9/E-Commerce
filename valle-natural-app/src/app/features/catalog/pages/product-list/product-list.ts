import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductCard } from '../../../../shared/components/product-card/product-card';
import { ProductSummary, Category } from '../../../../shared/models/product.model';
import { CatalogService } from '../../services/catalog.service';
import { catchError, of } from 'rxjs';
import { aceiteCocoImage, chiaImage, curcumaImage, linazaImage, macaNegraImage, mielImage, moringaImage, pecanasImage, polenImage, propoleoImage, quinuaPopImage, steviaYaconImage } from './product-list-images';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [ProductCard, RouterLink, DecimalPipe],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductListComponent implements OnInit {
  private readonly catalogService = inject(CatalogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalogImages = [
    mielImage,
    aceiteCocoImage,
    macaNegraImage,
    quinuaPopImage,
    chiaImage,
    pecanasImage,
    polenImage,
    steviaYaconImage,
    linazaImage,
    curcumaImage,
    moringaImage,
    propoleoImage
  ];

  readonly categoryImages = {
    superfoods: chiaImage,
    miel: mielImage,
    frutosSecos: pecanasImage,
    bienestar: moringaImage
  };

  // Signals for state
  readonly products = signal<ProductSummary[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly selectedCategoryId = signal<number | null>(null);
  readonly searchQuery = signal<string>('');
  readonly catalogMode = signal<'all' | 'offers' | 'stock'>('all');
  readonly isDataLoading = signal<boolean>(false);
  readonly visibleProducts = computed(() => {
    const products = this.products();
    const mode = this.catalogMode();

    if (mode === 'offers') {
      return products.filter((product, index) => index % 2 === 0 || product.name.toLowerCase().includes('miel') || product.name.toLowerCase().includes('stevia'));
    }

    if (mode === 'stock') {
      return products;
    }

    return products;
  });

  // Fallback Mock Data
  private readonly mockCategories: Category[] = [
    { id: 1, name: 'Superfoods', slug: 'superfoods', active: true },
    { id: 2, name: 'Miel y endulzantes', slug: 'miel', active: true },
    { id: 3, name: 'Frutos secos', slug: 'frutos-secos', active: true },
    { id: 4, name: 'Bienestar', slug: 'bienestar', active: true }
  ];

  private readonly mockProducts: ProductSummary[] = [
    {
      id: 1,
      name: 'Miel de Abeja Orgánica de Oxapampa',
      slug: 'miel-de-abeja-organica-oxapampa',
      sku: 'PROD-MIEL-01',
      price: 32.50,
      primaryImageUrl: mielImage
    },
    {
      id: 2,
      name: 'Aceite de Coco Prensado en Frío',
      slug: 'aceite-de-coco-prensado-frio',
      sku: 'PROD-COCO-02',
      price: 45.00,
      primaryImageUrl: aceiteCocoImage
    },
    {
      id: 3,
      name: 'Harina de Maca Gelatinizada Negra',
      slug: 'maca-negra-gelatinizada',
      sku: 'PROD-MACA-03',
      price: 28.00,
      primaryImageUrl: macaNegraImage
    },
    {
      id: 4,
      name: 'Cúrcuma Orgánica Premium en Polvo',
      slug: 'curcuma-organica-premium-polvo',
      sku: 'PROD-CURC-04',
      price: 21.00,
      primaryImageUrl: curcumaImage
    },
    {
      id: 5,
      name: 'Quinoa Real Orgánica Pop',
      slug: 'quinoa-real-organica-pop',
      sku: 'PROD-QUIN-05',
      price: 15.50,
      primaryImageUrl: quinuaPopImage
    },
    {
      id: 6,
      name: 'Polen Silvestre Natural de Cajamarca',
      slug: 'polen-silvestre-cajamarca',
      sku: 'PROD-POLE-06',
      price: 24.90,
      primaryImageUrl: polenImage
    },
    {
      id: 7,
      name: 'Semillas de Chía Premium Orgánica',
      slug: 'chia-premium-organica',
      sku: 'PROD-CHIA-07',
      price: 18.00,
      primaryImageUrl: chiaImage
    },
    {
      id: 8,
      name: 'Pecanas Peladas Seleccionadas de Ica',
      slug: 'pecanas-peladas-ica',
      sku: 'PROD-PECA-08',
      price: 34.00,
      primaryImageUrl: pecanasImage
    },
    {
      id: 9,
      name: 'Endulzante de Stevia y Yacón',
      slug: 'stevia-yacon-endulzante',
      sku: 'PROD-STEV-09',
      price: 19.50,
      primaryImageUrl: steviaYaconImage
    },
    {
      id: 10,
      name: 'Semillas de Linaza Molida Orgánica',
      slug: 'linaza-molida-organica',
      sku: 'PROD-LINA-10',
      price: 12.50,
      primaryImageUrl: linazaImage
    },
    {
      id: 11,
      name: 'Moringa Orgánica Pulverizada',
      slug: 'moringa-organica-pulverizada',
      sku: 'PROD-MORI-11',
      price: 25.00,
      primaryImageUrl: moringaImage
    },
    {
      id: 12,
      name: 'Extracto de Propóleo Puro Concentrado',
      slug: 'propoleo-puro-extracto',
      sku: 'PROD-PROP-12',
      price: 30.00,
      primaryImageUrl: propoleoImage
    }
  ];

  ngOnInit(): void {
    this.loadCategories();
    
    // Subscribe to query parameters for search/category filters
    this.route.queryParams.subscribe(params => {
      const search = params['search'] || '';
      const catId = params['category'] ? parseInt(params['category'], 10) : null;
      const mode = params['mode'] === 'offers' || params['mode'] === 'stock' ? params['mode'] : 'all';
      
      this.searchQuery.set(search);
      this.selectedCategoryId.set(catId);
      this.catalogMode.set(mode);
      
      this.loadProducts(catId, search);
    });
  }

  loadCategories(): void {
    this.catalogService.getCategories().pipe(
      catchError(() => {
        // Fallback to mock categories on network error
        return of({ success: true, data: this.mockCategories });
      })
    ).subscribe(res => {
      if (res.success && res.data) {
        this.categories.set(res.data);
      }
    });
  }

  loadProducts(categoryId: number | null, search: string): void {
    this.isDataLoading.set(true);
    this.catalogService.getProducts(categoryId ?? undefined, search, 0, 24).pipe(
      catchError(() => {
        // Fallback to mock data on network error with local filtering simulation
        return of({
          success: true,
          data: {
            content: this.mockProducts.filter(p => {
              const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
              
              if (!matchesSearch) return false;
              if (categoryId === null) return true;

              const nameLower = p.name.toLowerCase();
              if (categoryId === 1) { // Superfoods
                return nameLower.includes('maca') || nameLower.includes('quinoa') || nameLower.includes('chía') || nameLower.includes('chia') || nameLower.includes('linaza');
              } else if (categoryId === 2) { // Miel y endulzantes
                return nameLower.includes('miel') || nameLower.includes('stevia') || nameLower.includes('yacón') || nameLower.includes('yacon');
              } else if (categoryId === 3) { // Frutos secos
                return nameLower.includes('pecanas') || nameLower.includes('nuez') || nameLower.includes('almendra');
              } else if (categoryId === 4) { // Bienestar
                return nameLower.includes('aceite') || nameLower.includes('coco') || nameLower.includes('polen') || nameLower.includes('cúrcuma') || nameLower.includes('curcuma') || nameLower.includes('moringa') || nameLower.includes('propóleo') || nameLower.includes('propoleo');
              }
              return true;
            })
          }
        });
      })
    ).subscribe(res => {
      if (res.success && res.data && res.data.content) {
        // Map images to whatever the backend returned (fallback to mock catalog match if possible, otherwise cyclic list mapping)
        this.products.set(
          res.data.content.map((product, index) => {
            const matchedMock = this.mockProducts.find(p => p.sku === product.sku);
            return {
              ...product,
              primaryImageUrl: matchedMock ? matchedMock.primaryImageUrl : this.catalogImages[index % this.catalogImages.length]
            };
          })
        );
      } else {
        this.products.set(this.mockProducts);
      }
      this.isDataLoading.set(false);
    });
  }

  onPageSearchSubmit(searchValue: string): void {
    const search = searchValue.trim();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: search || null,
        category: this.selectedCategoryId(),
        mode: this.catalogMode(),
      }
    });
  }

  setCatalogMode(mode: 'all' | 'offers' | 'stock'): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.searchQuery() || null,
        category: this.selectedCategoryId(),
        mode,
      }
    });
  }

  setCategory(categoryId: number | null): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.searchQuery() || null,
        category: categoryId,
        mode: this.catalogMode(),
      }
    });
  }

  selectCategoryFromCard(slug: string): void {
    const category = this.categories().find(c => c.slug === slug || c.slug.toLowerCase().includes(slug.toLowerCase()));
    if (category) {
      this.setCategory(category.id);
    } else {
      // Fallback IDs matching category list
      let fallbackId: number | null = null;
      if (slug.includes('superfood')) fallbackId = 1;
      else if (slug.includes('miel')) fallbackId = 2;
      else if (slug.includes('seco')) fallbackId = 3;
      else if (slug.includes('bienestar')) fallbackId = 4;
      this.setCategory(fallbackId);
    }
    
    // Smooth scroll to catalog section
    setTimeout(() => {
      const catalogEl = document.getElementById('catalogo');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 80);
  }

  clearFilters(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: null,
        category: null,
        mode: 'all',
      }
    });
  }
}
