import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContextData {
  tenantId: bigint | undefined;
  bypassFilter: boolean;
}

@Injectable()
export class TenantContext {
  private readonly storage = new AsyncLocalStorage<TenantContextData>();

  /**
   * Run a callback inside the tenant context. Downstream code can
   * read/modify the store via getTenantId() and setTenantId().
   */
  run<T>(initial: TenantContextData, callback: () => T | Promise<T>): T | Promise<T> {
    return this.storage.run(initial, callback);
  }

  /**
   * Set the tenantId on the current (already running) AsyncLocalStorage store.
   * Must be called from within a run() context.
   */
  setTenantId(tenantId: bigint): void {
    const store = this.storage.getStore();
    if (store) {
      store.tenantId = tenantId;
    }
  }

  /**
   * Mark that this request should bypass automatic tenant filtering.
   * Used by Platform Super Admin endpoints that need cross-tenant access.
   */
  setBypassFilter(bypass: boolean): void {
    const store = this.storage.getStore();
    if (store) {
      store.bypassFilter = bypass;
    }
  }

  /**
   * Get the current tenantId for automatic Prisma filtering.
   * Returns undefined if bypassing or no tenant context.
   */
  getTenantId(): bigint | undefined {
    const store = this.storage.getStore();
    if (!store || store.bypassFilter) {
      return undefined;
    }
    return store.tenantId;
  }

  /**
   * Get the raw tenantId regardless of bypass setting.
   */
  getRawTenantId(): bigint | undefined {
    return this.storage.getStore()?.tenantId;
  }

  /**
   * Check if automatic filtering is being bypassed.
   */
  isBypassing(): boolean {
    return this.storage.getStore()?.bypassFilter === true;
  }
}
