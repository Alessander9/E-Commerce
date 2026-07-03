import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, UserAdmin } from '../../services/admin.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css'
})
export class AdminUsersComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly cdr = inject(ChangeDetectorRef);

  users: UserAdmin[] = [];
  isLoading = false;
  loadError: string | null = null;

  ngOnInit(): void {
    setTimeout(() => this.loadUsers(), 0);
  }

  loadUsers(): void {
    this.isLoading = true;
    this.loadError = null;
    this.cdr.detectChanges();
    this.adminService.getUsers().subscribe({
      next: (res) => {
        if (res.data) {
          this.users = res.data;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.loadError = 'No se pudieron cargar los usuarios. Verifica tu sesión.';
        this.cdr.detectChanges();
      }
    });
  }

  onToggleActive(user: UserAdmin): void {
    const nextState = !user.active;
    const actionText = nextState ? 'activar' : 'desactivar';
    if (confirm(`¿Estás seguro de ${actionText} la cuenta de ${user.firstName} ${user.lastName}?`)) {
      this.adminService.toggleUserActive(user.id, nextState).subscribe({
        next: () => {
          user.active = nextState;
        }
      });
    }
  }

  getRolesLabel(roles: string[]): string {
    return roles.map(r => r.replace('ROLE_', '')).join(', ');
  }
}
