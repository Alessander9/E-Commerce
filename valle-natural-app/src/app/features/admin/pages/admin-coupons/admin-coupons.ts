import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService, Coupon } from '../../services/admin.service';

@Component({
  selector: 'app-admin-coupons',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-coupons.html',
  styleUrl: './admin-coupons.css'
})
export class AdminCouponsComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  coupons: Coupon[] = [];
  isLoading = false;
  loadError: string | null = null;

  showForm = false;
  isEditing = false;
  selectedCoupon: Coupon | null = null;
  couponForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    setTimeout(() => this.loadCoupons(), 0);
  }

  initForm(): void {
    this.couponForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^[A-Z0-9_-]+$/)]],
      discountType: ['PERCENTAGE', Validators.required],
      discountValue: [0, [Validators.required, Validators.min(0)]],
      minOrderAmount: [0, [Validators.required, Validators.min(0)]],
      maxUses: [100, [Validators.required, Validators.min(1)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      active: [true]
    });
  }

  loadCoupons(): void {
    this.isLoading = true;
    this.loadError = null;
    this.cdr.detectChanges();
    this.adminService.getCoupons().subscribe({
      next: (res) => {
        if (res.data) {
          this.coupons = res.data;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.loadError = 'No se pudieron cargar los cupones. Verifica tu sesión.';
        this.cdr.detectChanges();
      }
    });
  }

  openCreate(): void {
    this.isEditing = false;
    this.selectedCoupon = null;
    this.couponForm.reset({
      code: '',
      discountType: 'PERCENTAGE',
      discountValue: 0,
      minOrderAmount: 0,
      maxUses: 100,
      startDate: '',
      endDate: '',
      active: true
    });
    this.showForm = true;
  }

  openEdit(coupon: Coupon): void {
    this.selectedCoupon = coupon;
    this.isEditing = true;
    
    // Format dates to YYYY-MM-DD for date inputs
    const startFormatted = coupon.startDate ? coupon.startDate.substring(0, 10) : '';
    const endFormatted = coupon.endDate ? coupon.endDate.substring(0, 10) : '';

    this.couponForm.patchValue({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount || 0,
      maxUses: coupon.maxUses || 100,
      startDate: startFormatted,
      endDate: endFormatted,
      active: coupon.active
    });
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.selectedCoupon = null;
  }

  onSubmit(): void {
    if (this.couponForm.invalid) {
      this.couponForm.markAllAsTouched();
      return;
    }

    const value = this.couponForm.value;
    const payload: Coupon = {
      ...value,
      discountValue: Number(value.discountValue),
      minOrderAmount: Number(value.minOrderAmount),
      maxUses: Number(value.maxUses),
      // Format to ISO with offset or UTC if backend expects OffsetDateTime
      startDate: new Date(value.startDate).toISOString(),
      endDate: new Date(value.endDate).toISOString()
    };

    if (this.isEditing && this.selectedCoupon && this.selectedCoupon.id) {
      this.adminService.updateCoupon(this.selectedCoupon.id, payload).subscribe({
        next: () => {
          this.closeForm();
          this.loadCoupons();
        }
      });
    } else {
      this.adminService.createCoupon(payload).subscribe({
        next: () => {
          this.closeForm();
          this.loadCoupons();
        }
      });
    }
  }
}
