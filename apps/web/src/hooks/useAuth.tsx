import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { apiRequest } from '../services/api';

export type RoleName = 'TENANT_ADMIN' | 'TENANT_MANAGER' | 'CUSTOMER';

export const ROLE_HIERARCHY: Record<string, number> = {
  TENANT_ADMIN: 3,         // Maximum role / Store Administrator
  TENANT_MANAGER: 2,       // Tenant Operations & Catalog
  CUSTOMER: 1,             // Storefront Shopper
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoadingAuth: boolean;
  currentRole: RoleName | string;
  roleLevel: number;
  isSuperAdmin: boolean;
  isTenantAdmin: boolean;
  isTenantManager: boolean;
  isCustomer: boolean;
  canAccessPlatform: boolean;
  canAccessTenantAdmin: boolean;
  canAccessCoupons: boolean;
  hasRole: (roles: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('cleo_auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('cleo_auth_token'));
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  useEffect(() => {
    if (token) {
      apiRequest<User>('/api/auth/profile')
        .then((profile) => {
          setUser(profile);
          localStorage.setItem('cleo_auth_user', JSON.stringify(profile));
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setIsLoadingAuth(false);
        });
    } else {
      setIsLoadingAuth(false);
    }
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('cleo_auth_token', newToken);
    localStorage.setItem('cleo_auth_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('cleo_auth_token');
    localStorage.removeItem('cleo_auth_user');
    setToken(null);
    setUser(null);
  };

  // Robust role resolution from direct field or memberships hierarchy
  const resolveRole = (): RoleName => {
    if (!user) return 'CUSTOMER';
    if (user.currentRole && (user.currentRole === 'TENANT_ADMIN' || user.currentRole === 'TENANT_MANAGER' || user.currentRole === 'CUSTOMER')) {
      return user.currentRole as RoleName;
    }

    if (user.memberships && user.memberships.length > 0) {
      const roleNames = user.memberships.map((m) => m.role);
      if (roleNames.includes('TENANT_ADMIN')) {
        return 'TENANT_ADMIN';
      }
      if (roleNames.includes('TENANT_MANAGER')) {
        return 'TENANT_MANAGER';
      }
    }

    return 'CUSTOMER';
  };

  const currentRole = resolveRole();
  const roleLevel = ROLE_HIERARCHY[currentRole] || 0;

  const isTenantAdmin = currentRole === 'TENANT_ADMIN';
  const isSuperAdmin = false; // SuperAdmin removed - Administrator is the top role
  const isTenantManager = currentRole === 'TENANT_MANAGER';
  const isCustomer = currentRole === 'CUSTOMER' || (!isTenantAdmin && !isTenantManager && !!user);

  // Hierarchy capabilities
  const canAccessPlatform = isTenantAdmin;
  const canAccessTenantAdmin = roleLevel >= ROLE_HIERARCHY.TENANT_MANAGER; // Level 2, 3
  const canAccessCoupons = isTenantAdmin;                                 // Level 3 (Admin)

  const hasRole = (roles: string | string[]) => {
    if (!user) return false;
    const roleList = Array.isArray(roles) ? roles : [roles];
    return roleList.includes(currentRole);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        logout,
        isLoadingAuth,
        currentRole,
        roleLevel,
        isSuperAdmin,
        isTenantAdmin,
        isTenantManager,
        isCustomer,
        canAccessPlatform,
        canAccessTenantAdmin,
        canAccessCoupons,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

