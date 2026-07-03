import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

interface QuickAccessRole {
  label: string;
  email: string;
  password: string;
  icon: string;
  role: 'admin' | 'client';
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // UI States
  readonly showPassword = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isSubmitting = signal<boolean>(false);
  readonly activeQuickRole = signal<string | null>(null);

  constructor() {
    this.route.queryParams.subscribe(params => {
      if (params['reason'] === 'expired') {
        this.errorMessage.set('Tu sesión ha expirado por inactividad. Por favor, inicia sesión de nuevo.');
      }
    });
  }

  // Quick access roles
  readonly quickRoles: QuickAccessRole[] = [
    {
      label: 'Administrador',
      email: 'admin@allamarasuperfoods.pe',
      password: 'Admin2026!',
      icon: 'shield',
      role: 'admin'
    },
    {
      label: 'Cliente',
      email: 'cliente@allamarasuperfoods.pe',
      password: 'Cliente2026!',
      icon: 'user',
      role: 'client'
    }
  ];

  // Form
  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  quickLogin(role: QuickAccessRole): void {
    this.loginForm.patchValue({
      email: role.email,
      password: role.password
    });
    this.errorMessage.set(null);
    this.activeQuickRole.set(role.role);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const credentials = this.loginForm.value;
    this.authService.login(credentials).subscribe({
      next: () => {
        // Redirect to return URL or default based on role
        let returnUrl = this.route.snapshot.queryParams['returnUrl'];
        if (!returnUrl || returnUrl === '/') {
          returnUrl = this.authService.isAdmin() ? '/admin' : '/';
        }
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.activeQuickRole.set(null);
        if (err.error && err.error.message) {
          this.errorMessage.set(err.error.message);
        } else {
          this.errorMessage.set('Correo o contraseña incorrectos. Inténtalo de nuevo.');
        }
      }
    });
  }
}
