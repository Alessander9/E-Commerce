import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tenant } from '../types';
import { apiRequest } from '../services/api';

interface TenantContextType {
  currentTenant: Tenant | null;
  tenantSlug: string;
  setTenantSlug: (slug: string) => void;
  isLoadingTenant: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenantSlug, setTenantSlug] = useState<string>(() => {
    return localStorage.getItem('cleo_tenant_slug') || 'perucat';
  });
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [isLoadingTenant, setIsLoadingTenant] = useState<boolean>(true);

  useEffect(() => {
    localStorage.setItem('cleo_tenant_slug', tenantSlug);
    setIsLoadingTenant(true);

    apiRequest<Tenant>(`/api/platform/tenants/public/resolve/${tenantSlug}`, {}, tenantSlug)
      .then((data) => {
        setCurrentTenant(data);
        if (data?.primaryColor) {
          document.documentElement.style.setProperty('--tenant-primary-hex', data.primaryColor);
        }
        if (data?.secondaryColor) {
          document.documentElement.style.setProperty('--tenant-secondary-hex', data.secondaryColor);
        }
      })
      .catch((err) => {
        console.error('Error fetching tenant metadata:', err);
      })
      .finally(() => {
        setIsLoadingTenant(false);
      });
  }, [tenantSlug]);

  return (
    <TenantContext.Provider
      value={{
        currentTenant,
        tenantSlug,
        setTenantSlug,
        isLoadingTenant,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

