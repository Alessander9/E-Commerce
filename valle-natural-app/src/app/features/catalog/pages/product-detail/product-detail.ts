import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { CatalogService } from '../../services/catalog.service';
import { CartService } from '../../../cart-wishlist/services/cart.service';
import { WishlistService } from '../../../cart-wishlist/services/wishlist.service';
import { Product } from '../../../../shared/models/product.model';
import { catchError, of } from 'rxjs';
import { aceiteCocoImage, chiaImage, curcumaImage, linazaImage, macaNegraImage, mielImage, moringaImage, pecanasImage, polenImage, propoleoImage, quinuaPopImage, steviaYaconImage } from '../product-list/product-list-images';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetailComponent implements OnInit {
  private readonly catalogService = inject(CatalogService);
  readonly cartService = inject(CartService);
  readonly wishlistService = inject(WishlistService);
  private readonly route = inject(ActivatedRoute);

  // States
  readonly product = signal<Product | null>(null);
  readonly activeImageUrl = signal<string>('');
  readonly quantity = signal<number>(1);
  readonly isDataLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  // Expanded fallback mockup database matching catalog
  private readonly mockDetailProducts: Product[] = [
    {
      id: 1,
      name: 'Miel de Abeja Orgánica de Oxapampa',
      slug: 'miel-de-abeja-organica-oxapampa',
      description: 'Miel 100% natural, recolectada de abejas silvestres en los densos bosques de Oxapampa. Es una miel pura, sin filtrar y libre de conservantes o azúcares añadidos, ideal para endulzar tus bebidas y postres de forma saludable y natural.',
      sku: 'PROD-MIEL-01',
      weight: 1.0,
      height: 15.0,
      width: 8.0,
      length: 8.0,
      active: true,
      price: 32.50,
      availableStock: 25,
      imageUrls: [
        mielImage,
        'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      id: 2,
      name: 'Aceite de Coco Prensado en Frío',
      slug: 'aceite-de-coco-prensado-frio',
      description: 'Aceite de coco extra virgen prensado en frío a partir de cocos frescos seleccionados. Ideal para cocinar de manera saludable, repostería vegana y para tratamientos de hidratación capilar y dérmica de forma completamente orgánica.',
      sku: 'PROD-COCO-02',
      weight: 0.5,
      height: 12.0,
      width: 7.0,
      length: 7.0,
      active: true,
      price: 45.00,
      availableStock: 18,
      imageUrls: [
        aceiteCocoImage,
        'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      id: 3,
      name: 'Harina de Maca Gelatinizada Negra',
      slug: 'maca-negra-gelatinizada',
      description: 'Harina de Maca Gelatinizada Negra de los andes centrales del Perú. Al ser gelatinizada, resulta mucho más fácil de digerir y asimilar. Reconocido suplemento tradicional para aumentar la vitalidad, resistencia y el enfoque mental diario.',
      sku: 'PROD-MACA-03',
      weight: 0.25,
      height: 18.0,
      width: 12.0,
      length: 5.0,
      active: true,
      price: 28.00,
      availableStock: 30,
      imageUrls: [
        macaNegraImage,
        'https://images.unsplash.com/photo-1515942400420-2b98fed1f515?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      id: 4,
      name: 'Cúrcuma Orgánica Premium en Polvo',
      slug: 'curcuma-organica-premium-polvo',
      description: 'Polvo de cúrcuma orgánica de color intenso, excelente aroma y gran sabor. Es un condimento tradicional y superalimento apreciado por sus propiedades antioxidantes naturales y sus beneficios para fortalecer el sistema inmunitario.',
      sku: 'PROD-CURC-04',
      weight: 0.15,
      height: 14.0,
      width: 10.0,
      length: 4.0,
      active: true,
      price: 21.00,
      availableStock: 15,
      imageUrls: [
        curcumaImage,
        'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      id: 5,
      name: 'Quinoa Real Orgánica Pop',
      slug: 'quinoa-real-organica-pop',
      description: 'Granos de Quinoa Real Orgánica blanca expandida a base de calor (Pop). Un cereal listo para consumir, sumamente ligero, rico en proteínas y minerales, perfecto para desayunos rápidos, snacks infantiles o repostería ligera.',
      sku: 'PROD-QUIN-05',
      weight: 0.2,
      height: 22.0,
      width: 14.0,
      length: 6.0,
      active: true,
      price: 15.50,
      availableStock: 40,
      imageUrls: [
        quinuaPopImage,
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      id: 6,
      name: 'Polen Silvestre Natural de Cajamarca',
      slug: 'polen-silvestre-cajamarca',
      description: 'Polen natural recolectado y deshidratado al sol en las zonas andinas de Cajamarca. Excelente reconstituyente biológico, rico en vitaminas, minerales, enzimas y aminoácidos que mejoran las defensas naturales del cuerpo.',
      sku: 'PROD-POLE-06',
      weight: 0.2,
      height: 12.0,
      width: 8.0,
      length: 8.0,
      active: true,
      price: 24.90,
      availableStock: 12,
      imageUrls: [
        polenImage,
        'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      id: 7,
      name: 'Semillas de Chía Premium Orgánica',
      slug: 'chia-premium-organica',
      description: 'Semillas de chía orgánica de la más alta pureza. Excelente fuente vegetal de fibra dietética, ácidos grasos esenciales Omega-3 y proteínas. Es un superfood ideal para preparar puddings saludables, ensaladas o repostería ligera.',
      sku: 'PROD-CHIA-07',
      weight: 0.3,
      height: 16.0,
      width: 10.0,
      length: 5.0,
      active: true,
      price: 18.00,
      availableStock: 35,
      imageUrls: [
        chiaImage,
        'https://images.unsplash.com/photo-1599059021750-8b980b7b5720?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      id: 8,
      name: 'Pecanas Peladas Seleccionadas de Ica',
      slug: 'pecanas-peladas-ica',
      description: 'Nueces de pecana fresca cultivada y procesada artesanalmente en Ica, peladas al natural y seleccionadas a mano. Un snack delicioso y saciante, rico en grasas saludables monoinsaturadas y antioxidantes naturales.',
      sku: 'PROD-PECA-08',
      weight: 0.25,
      height: 20.0,
      width: 13.0,
      length: 5.0,
      active: true,
      price: 34.00,
      availableStock: 20,
      imageUrls: [
        pecanasImage,
        'https://images.unsplash.com/photo-1606923829579-0ac9c49efc72?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      id: 9,
      name: 'Endulzante de Stevia y Yacón',
      slug: 'stevia-yacon-endulzante',
      description: 'Mezcla perfecta de extracto purificado de Stevia Rebaudiana y concentrado de jarabe de Yacón andino. Un endulzante natural líquido o soluble de bajo índice glucémico, apto para diabéticos y dietas bajas en calorías.',
      sku: 'PROD-STEV-09',
      weight: 0.1,
      height: 11.0,
      width: 5.0,
      length: 5.0,
      active: true,
      price: 19.50,
      availableStock: 22,
      imageUrls: [
        steviaYaconImage,
        'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      id: 10,
      name: 'Semillas de Linaza Molida Orgánica',
      slug: 'linaza-molida-organica',
      description: 'Semillas de linaza dorada molida en frío para mantener intactas sus propiedades y ácidos grasos esenciales. Excelente regulador digestivo natural gracias a su elevado aporte de fibra soluble, ideal para avenas y batidos.',
      sku: 'PROD-LINA-10',
      weight: 0.3,
      height: 18.0,
      width: 11.0,
      length: 5.0,
      active: true,
      price: 12.50,
      availableStock: 28,
      imageUrls: [
        linazaImage,
        'https://images.unsplash.com/photo-1599059021750-8b980b7b5720?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      id: 11,
      name: 'Moringa Orgánica Pulverizada',
      slug: 'moringa-organica-pulverizada',
      description: 'Hojas frescas de moringa orgánica deshidratadas a la sombra y molidas a baja temperatura. Considerado un superalimento multi-vitamínico excepcional, rico en hierro, calcio, aminoácidos y antioxidantes esenciales.',
      sku: 'PROD-MORI-11',
      weight: 0.15,
      height: 14.0,
      width: 10.0,
      length: 4.0,
      active: true,
      price: 25.00,
      availableStock: 16,
      imageUrls: [
        moringaImage,
        'https://images.unsplash.com/photo-1515942400420-2b98fed1f515?auto=format&fit=crop&q=80&w=800'
      ]
    },
    {
      id: 12,
      name: 'Extracto de Propóleo Puro Concentrado',
      slug: 'propoleo-puro-extracto',
      description: 'Solución extracto alcohólico de propóleo de abejas altamente concentrado. Funciona como un potente antiviral, antiinflamatorio y antiséptico natural. Ideal para gargarismos, resfriados o para fortalecer la inmunidad diaria.',
      sku: 'PROD-PROP-12',
      weight: 0.05,
      height: 10.0,
      width: 4.5,
      length: 4.5,
      active: true,
      price: 30.00,
      availableStock: 14,
      imageUrls: [
        propoleoImage,
        'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&q=80&w=800'
      ]
    }
  ];

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.loadProduct(slug);
      }
    });
  }

  loadProduct(slug: string): void {
    this.isDataLoading.set(true);
    this.errorMessage.set(null);

    this.catalogService.getProductBySlug(slug).pipe(
      catchError(() => {
        // Find correct fallback mockup by slug matching, default to Oxapampa Honey
        const matchedProduct = this.mockDetailProducts.find(p => p.slug === slug) || this.mockDetailProducts[0];
        return of({
          success: true,
          data: matchedProduct
        });
      })
    ).subscribe(res => {
      if (res.success && res.data) {
        // Try to enrich image URLs with locally imported images if they are fallback assets/placeholders
        let updatedData = { ...res.data };
        const matchedMock = this.mockDetailProducts.find(p => p.sku === res.data.sku);
        if (matchedMock) {
          updatedData.imageUrls = matchedMock.imageUrls;
        }

        this.product.set(updatedData);
        if (updatedData.imageUrls && updatedData.imageUrls.length > 0) {
          this.activeImageUrl.set(updatedData.imageUrls[0]);
        } else {
          this.activeImageUrl.set('assets/placeholder-product.jpg');
        }
      } else {
        this.errorMessage.set('No pudimos encontrar el producto solicitado.');
      }
      this.isDataLoading.set(false);
    });
  }

  changeActiveImage(url: string): void {
    this.activeImageUrl.set(url);
  }

  incrementQuantity(): void {
    const stock = this.product()?.availableStock || 99;
    if (this.quantity() < stock) {
      this.quantity.update(q => q + 1);
    }
  }

  decrementQuantity(): void {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  isWishlisted(): boolean {
    const prod = this.product();
    return prod ? this.wishlistService.isInWishlist(prod.id) : false;
  }

  onToggleWishlist(): void {
    const prod = this.product();
    if (prod) {
      this.wishlistService.toggleProduct(prod.id).subscribe();
    }
  }

  onAddToCart(): void {
    const prod = this.product();
    if (prod) {
      this.cartService.addItem(prod.id, prod.name, prod.price, this.quantity()).subscribe({
        next: () => {
          this.quantity.set(1);
        }
      });
    }
  }

  consultOnWhatsApp(): void {
    const prod = this.product();
    if (prod) {
      const message = encodeURIComponent(
        `Hola Valle Natural, me interesa el producto "${prod.name}" (SKU: ${prod.sku}). ¿Tienen stock disponible hoy?`
      );
      window.open(`https://wa.me/51999999999?text=${message}`, '_blank', 'noopener,noreferrer');
    }
  }
}
