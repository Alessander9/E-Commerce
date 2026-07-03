import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, AuditLog } from '../../services/admin.service';

@Component({
  selector: 'app-admin-audit',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-audit.html',
  styleUrl: './admin-audit.css'
})
export class AdminAuditComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly cdr = inject(ChangeDetectorRef);

  logs: AuditLog[] = [];
  isLoading = false;
  loadError: string | null = null;
  selectedLogId: number | null = null;

  ngOnInit(): void {
    setTimeout(() => this.loadLogs(), 0);
  }

  loadLogs(): void {
    this.isLoading = true;
    this.loadError = null;
    this.cdr.detectChanges();
    this.adminService.getAuditLogs().subscribe({
      next: (res) => {
        if (res.data) {
          // Sort by date descending
          this.logs = res.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.loadError = 'No se pudieron cargar los logs de auditoría. Verifica tu sesión.';
        this.cdr.detectChanges();
      }
    });
  }

  toggleExpand(log: AuditLog): void {
    if (this.selectedLogId === log.id) {
      this.selectedLogId = null;
    } else {
      this.selectedLogId = log.id;
    }
  }

  formatJson(obj: any): string {
    if (!obj) return '-';
    if (typeof obj === 'string') {
      try {
        return JSON.stringify(JSON.parse(obj), null, 2);
      } catch {
        return obj;
      }
    }
    return JSON.stringify(obj, null, 2);
  }
}
