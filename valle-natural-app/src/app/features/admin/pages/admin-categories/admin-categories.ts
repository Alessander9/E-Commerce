import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { CatalogService } from '../../../catalog/services/catalog.service';
import { Category } from '../../../../shared/models/product.model';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-categories.html',
  styleUrl: './admin-categories.css'
})
export class AdminCategoriesComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly catalogService = inject(CatalogService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  categories: Category[] = [];
  isLoading = false;
  loadError: string | null = null;

  // Form toggles
  showForm = false;
  isEditing = false;
  selectedCategory: Category | null = null;
  categoryForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    setTimeout(() => this.loadCategories(), 0);
  }

  initForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      slug: ['', Validators.required],
      description: [''],
      parentId: [null],
      active: [true]
    });
  }

  loadCategories(): void {
    this.isLoading = true;
    this.loadError = null;
    this.cdr.detectChanges();
    this.catalogService.getCategories().subscribe({
      next: (res) => {
        if (res.data) {
          this.categories = res.data;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.loadError = 'No se pudieron cargar las categorías. Verifica tu sesión.';
        this.cdr.detectChanges();
      }
    });
  }

  getCategoryName(id?: number): string {
    if (!id) return '-';
    const cat = this.categories.find(c => c.id === id);
    return cat ? cat.name : '-';
  }

  openCreate(): void {
    this.isEditing = false;
    this.selectedCategory = null;
    this.categoryForm.reset({
      name: '',
      slug: '',
      description: '',
      parentId: null,
      active: true
    });
    this.showForm = true;
  }

  openEdit(category: Category): void {
    this.selectedCategory = category;
    this.isEditing = true;
    this.categoryForm.patchValue({
      name: category.name,
      slug: category.slug,
      description: (category as any).description || '',
      parentId: category.parentId || null,
      active: category.active
    });
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.selectedCategory = null;
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const payload = this.categoryForm.value;
    if (payload.parentId) {
      payload.parentId = Number(payload.parentId);
    }

    if (this.isEditing && this.selectedCategory) {
      this.adminService.updateCategory(this.selectedCategory.id, payload).subscribe({
        next: () => {
          this.closeForm();
          this.loadCategories();
        }
      });
    } else {
      this.adminService.createCategory(payload).subscribe({
        next: () => {
          this.closeForm();
          this.loadCategories();
        }
      });
    }
  }

  onDelete(category: Category): void {
    if (confirm(`¿Estás seguro de eliminar la categoría ${category.name}? Se eliminarán o desvincularán sus subcategorías.`)) {
      this.adminService.deleteCategory(category.id).subscribe({
        next: () => {
          this.loadCategories();
        }
      });
    }
  }
}
