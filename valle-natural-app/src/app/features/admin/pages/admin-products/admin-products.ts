import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { CatalogService } from '../../../catalog/services/catalog.service';
import { Product, ProductSummary } from '../../../../shared/models/product.model';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.css'
})
export class AdminProductsComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly catalogService = inject(CatalogService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  products: ProductSummary[] = [];
  totalPages = 0;
  currentPage = 0;
  totalElements = 0;
  isLoading = false;
  loadError: string | null = null;

  // Form toggles
  showForm = false;
  isEditing = false;
  selectedProduct: Product | null = null;
  productForm!: FormGroup;

  // Stock/Price updates
  showStockModal = false;
  showPriceModal = false;
  stockForm!: FormGroup;
  priceForm!: FormGroup;

  ngOnInit(): void {
    this.initForms();
    // Defer to next tick to ensure component is fully attached to the view tree
    setTimeout(() => this.loadProducts(), 0);
  }

  initForms(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      slug: ['', Validators.required],
      description: ['', Validators.required],
      sku: ['', Validators.required],
      weight: [0, [Validators.required, Validators.min(0)]],
      height: [0, [Validators.required, Validators.min(0)]],
      width: [0, [Validators.required, Validators.min(0)]],
      length: [0, [Validators.required, Validators.min(0)]],
      price: [0, [Validators.required, Validators.min(0)]],
      availableStock: [0, [Validators.required, Validators.min(0)]],
      imageUrls: [''],
      active: [true]
    });

    this.stockForm = this.fb.group({
      availableStock: [0, [Validators.required, Validators.min(0)]]
    });

    this.priceForm = this.fb.group({
      price: [0, [Validators.required, Validators.min(0)]]
    });
  }

  loadProducts(page: number = 0): void {
    this.isLoading = true;
    this.loadError = null;
    this.cdr.detectChanges();
    this.catalogService.getProducts(undefined, undefined, page, 8).subscribe({
      next: (res) => {
        if (res.data) {
          this.products = res.data.content;
          this.totalPages = res.data.totalPages;
          this.currentPage = res.data.number;
          this.totalElements = res.data.totalElements;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.loadError = 'No se pudieron cargar los productos. Verifica tu sesión.';
        this.cdr.detectChanges();
      }
    });
  }

  onPageChange(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.loadProducts(page);
    }
  }

  openCreate(): void {
    this.isEditing = false;
    this.selectedProduct = null;
    this.productForm.reset({
      name: '',
      slug: '',
      description: '',
      sku: '',
      weight: 0,
      height: 0,
      width: 0,
      length: 0,
      price: 0,
      availableStock: 0,
      imageUrls: '',
      active: true
    });
    this.productForm.get('price')?.enable();
    this.productForm.get('availableStock')?.enable();
    this.showForm = true;
  }

  openEdit(summary: ProductSummary): void {
    this.isLoading = true;
    this.catalogService.getProductBySlug(summary.slug).subscribe({
      next: (res) => {
        if (res.data) {
          this.selectedProduct = res.data;
          this.isEditing = true;
          this.productForm.patchValue({
            name: res.data.name,
            slug: res.data.slug,
            description: res.data.description,
            sku: res.data.sku,
            weight: res.data.weight,
            height: res.data.height,
            width: res.data.width,
            length: res.data.length,
            price: res.data.price,
            availableStock: res.data.availableStock,
            imageUrls: res.data.imageUrls ? res.data.imageUrls.join(', ') : '',
            active: res.data.active
          });
          // Disable stock and price in general form since they have specific endpoint calls
          this.productForm.get('price')?.disable();
          this.productForm.get('availableStock')?.disable();
          this.showForm = true;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  closeForm(): void {
    this.showForm = false;
    this.selectedProduct = null;
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const rawValue = this.productForm.getRawValue();
    // Parse comma separated image URLs
    const imagesArray = rawValue.imageUrls
      ? rawValue.imageUrls.split(',').map((url: string) => url.trim()).filter((url: string) => url.length > 0)
      : [];

    const payload = {
      ...rawValue,
      imageUrls: imagesArray
    };

    if (this.isEditing && this.selectedProduct) {
      this.adminService.updateProduct(this.selectedProduct.id, payload).subscribe({
        next: () => {
          this.closeForm();
          this.loadProducts(this.currentPage);
        }
      });
    } else {
      this.adminService.createProduct(payload).subscribe({
        next: () => {
          this.closeForm();
          this.loadProducts(0);
        }
      });
    }
  }

  openStockModal(summary: ProductSummary): void {
    this.isLoading = true;
    this.catalogService.getProductBySlug(summary.slug).subscribe({
      next: (res) => {
        if (res.data) {
          this.selectedProduct = res.data;
          this.stockForm.patchValue({
            availableStock: res.data.availableStock
          });
          this.showStockModal = true;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  closeStockModal(): void {
    this.showStockModal = false;
    this.selectedProduct = null;
  }

  onUpdateStock(): void {
    if (this.stockForm.invalid || !this.selectedProduct) return;
    const stock = this.stockForm.value.availableStock;
    this.adminService.updateInventory(this.selectedProduct.id, stock).subscribe({
      next: () => {
        this.closeStockModal();
        this.loadProducts(this.currentPage);
      }
    });
  }

  openPriceModal(summary: ProductSummary): void {
    this.isLoading = true;
    this.catalogService.getProductBySlug(summary.slug).subscribe({
      next: (res) => {
        if (res.data) {
          this.selectedProduct = res.data;
          this.priceForm.patchValue({
            price: res.data.price
          });
          this.showPriceModal = true;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  closePriceModal(): void {
    this.showPriceModal = false;
    this.selectedProduct = null;
  }

  onAddPrice(): void {
    if (this.priceForm.invalid || !this.selectedProduct) return;
    const price = this.priceForm.value.price;
    this.adminService.addPrice(this.selectedProduct.id, price).subscribe({
      next: () => {
        this.closePriceModal();
        this.loadProducts(this.currentPage);
      }
    });
  }

  onDelete(summary: ProductSummary): void {
    if (confirm(`¿Estás seguro de eliminar el producto ${summary.name}?`)) {
      this.adminService.deleteProduct(summary.id).subscribe({
        next: () => {
          this.loadProducts(this.currentPage);
        }
      });
    }
  }
}
