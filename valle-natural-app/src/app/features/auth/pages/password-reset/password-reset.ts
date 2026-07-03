import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './password-reset.html',
  styleUrl: './password-reset.css'
})
export class PasswordResetComponent {
  private readonly fb = inject(FormBuilder);

  // States
  readonly step = signal<'request' | 'sent'>('request');
  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  // Form
  readonly resetForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  onSubmit(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    // Simulate sending email (Backend doesn't have public reset endpoint, handles through token)
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.step.set('sent');
    }, 1200);
  }
}
