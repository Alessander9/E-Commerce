import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { UserService } from '../../../../core/services/user.service';
import { ShippingService } from '../../services/shipping.service';
import { OrderService } from '../../services/order.service';
import { CartService } from '../../../../features/cart-wishlist/services/cart.service';
import { Address } from '../../../../shared/models/user.model';
import { ShippingZone } from '../../../../shared/models/shipping.model';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-checkout-form',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './checkout-form.html',
  styleUrl: './checkout-form.css'
})
export class CheckoutFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly shippingService = inject(ShippingService);
  private readonly orderService = inject(OrderService);
  readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  // States
  readonly addresses = signal<Address[]>([]);
  readonly shippingZones = signal<ShippingZone[]>([]);
  readonly selectedAddressId = signal<number | null>(null);
  readonly shippingCost = signal<number>(0);
  readonly showNewAddressForm = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  // Forms
  readonly addressForm = this.fb.group({
    label: ['', Validators.required],
    street: ['', Validators.required],
    number: ['', Validators.required],
    references: [''],
    district: ['', Validators.required],
    province: ['', Validators.required],
    department: ['', Validators.required],
    zipCode: ['']
  });

  readonly couponForm = this.fb.group({
    couponCode: ['']
  });

  ngOnInit(): void {
    this.loadAddresses();
    this.loadZones();
  }

  loadAddresses(): void {
    this.userService.getAddresses().pipe(
      catchError(() => of({ success: false, data: [] }))
    ).subscribe(res => {
      if (res.success && res.data) {
        this.addresses.set(res.data);
        if (res.data.length > 0) {
          this.onSelectAddress(res.data[0].id);
        } else {
          this.showNewAddressForm.set(true);
        }
      }
    });
  }

  loadZones(): void {
    this.shippingService.getZones().pipe(
      catchError(() => of({ success: false, data: [] }))
    ).subscribe(res => {
      if (res.success && res.data) {
        this.shippingZones.set(res.data);
      }
    });
  }

  onSelectAddress(addressId: number): void {
    this.selectedAddressId.set(addressId);
    this.showNewAddressForm.set(false);
    this.calculateShippingRate(addressId);
  }

  calculateShippingRate(addressId: number): void {
    this.shippingService.calculateRate(addressId).pipe(
      catchError(() => {
        // Fallback flat rate for demo
        return of({ success: true, data: 15.0 });
      })
    ).subscribe(res => {
      if (res.success && res.data !== undefined) {
        this.shippingCost.set(Number(res.data));
      }
    });
  }

  onAddNewAddress(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formVal = this.addressForm.value;
    const request = {
      department: formVal.department || '',
      province: formVal.province || '',
      district: formVal.district || '',
      addressLine: (formVal.street || '') + ' ' + (formVal.number || ''),
      reference: formVal.references || undefined,
      isDefault: false
    };

    this.userService.addAddress(request).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.success && res.data) {
          const newAddress = res.data;
          this.addresses.update(arr => [...arr, newAddress]);
          this.onSelectAddress(newAddress.id);
          this.addressForm.reset();
          this.showNewAddressForm.set(false);
        }
      },
      error: () => {
        this.isSubmitting.set(false);
        this.errorMessage.set('No pudimos guardar la dirección. Inténtalo de nuevo.');
      }
    });
  }

  onPlaceOrder(): void {
    const addressId = this.selectedAddressId();
    if (!addressId) {
      this.errorMessage.set('Por favor, selecciona una dirección de envío.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    const couponCode = this.couponForm.get('couponCode')?.value || undefined;

    this.orderService.createOrder(addressId, couponCode).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.success && res.data) {
          const createdOrder = res.data;
          // Reload cart to clear header badges
          this.cartService.clearCart().subscribe();
          // Navigate to payment page with the created order number
          this.router.navigate(['/checkout/payment', createdOrder.orderNumber]);
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        if (err.error && err.error.message) {
          this.errorMessage.set(err.error.message);
        } else {
          this.errorMessage.set('No pudimos crear el pedido. Inténtalo de nuevo.');
        }
      }
    });
  }
}
