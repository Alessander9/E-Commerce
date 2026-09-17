import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { StorefrontLayout } from '../layouts/StorefrontLayout';
import { TenantAdminLayout } from '../layouts/TenantAdminLayout';
import { PlatformAdminLayout } from '../layouts/PlatformAdminLayout';

import { Home } from '../features/storefront/pages/Home';
import { Catalog } from '../features/storefront/pages/Catalog';
import { ProductDetail } from '../features/storefront/pages/ProductDetail';
import { Checkout } from '../features/storefront/pages/Checkout';
import { Orders } from '../features/storefront/pages/Orders';
import { Favorites } from '../features/storefront/pages/Favorites';

import { Login } from '../features/auth/pages/Login';
import { Register } from '../features/auth/pages/Register';
import { ForgotPassword } from '../features/auth/pages/ForgotPassword';
import { ResetPassword } from '../features/auth/pages/ResetPassword';

import { Dashboard } from '../features/tenant-admin/pages/Dashboard';
import { AdminProducts } from '../features/tenant-admin/pages/AdminProducts';
import { AdminOrders } from '../features/tenant-admin/pages/AdminOrders';
import { AdminOrderDetail } from '../features/tenant-admin/pages/AdminOrderDetail';
import { AdminInventory } from '../features/tenant-admin/pages/AdminInventory';
import { AdminSettings } from '../features/tenant-admin/pages/AdminSettings';
import { AdminCoupons } from '../features/tenant-admin/pages/AdminCoupons';
import { PlatformDashboard } from '../features/platform-admin/pages/PlatformDashboard';
import { TenantsManagement } from '../features/platform-admin/pages/TenantsManagement';
import { PlatformUsersManagement } from '../features/platform-admin/pages/PlatformUsersManagement';
import { PlatformAuditLogs } from '../features/platform-admin/pages/PlatformAuditLogs';
import { NotFound } from '../features/storefront/pages/NotFound';

import { ProtectedRoute } from '../components/auth/ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 1. Storefront Routes */}
      <Route path="/" element={<StorefrontLayout />}>
        <Route index element={<Home />} />
        <Route path="productos" element={<Catalog />} />
        <Route path="productos/:slug" element={<ProductDetail />} />
        <Route path="products/:slug" element={<ProductDetail />} />
        <Route
          path="checkout"
          element={
            <ProtectedRoute minRoleLevel={1}>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="mis-pedidos"
          element={
            <ProtectedRoute minRoleLevel={1}>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="pedidos"
          element={
            <ProtectedRoute minRoleLevel={1}>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="pedidos/:orderNumber"
          element={
            <ProtectedRoute minRoleLevel={1}>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="favoritos"
          element={
            <ProtectedRoute minRoleLevel={1}>
              <Favorites />
            </ProtectedRoute>
          }
        />
        <Route
          path="mi-cuenta"
          element={
            <ProtectedRoute minRoleLevel={1}>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="portal-cliente"
          element={
            <ProtectedRoute minRoleLevel={1}>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        {/* 404 inside Storefront */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* 2. Tenant Admin Routes (Level 2+: TENANT_MANAGER, TENANT_ADMIN) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['TENANT_ADMIN', 'TENANT_MANAGER']}>
            <TenantAdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="productos" element={<AdminProducts />} />
        <Route path="pedidos" element={<AdminOrders />} />
        <Route path="pedidos/:id" element={<AdminOrderDetail />} />
        <Route path="inventario" element={<AdminInventory />} />
        <Route path="configuracion" element={<AdminSettings />} />
        {/* Coupons are strictly for TENANT_ADMIN (Level 3) */}
        <Route
          path="cupones"
          element={
            <ProtectedRoute allowedRoles={['TENANT_ADMIN']}>
              <AdminCoupons />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 3. Platform Admin Routes (Level 3: TENANT_ADMIN) */}
      <Route
        path="/platform"
        element={
          <ProtectedRoute allowedRoles={['TENANT_ADMIN']}>
            <PlatformAdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PlatformDashboard />} />
        <Route path="tenants" element={<TenantsManagement />} />
        <Route path="usuarios" element={<PlatformUsersManagement />} />
        <Route path="auditoria" element={<PlatformAuditLogs />} />
      </Route>
    </Routes>
  );
};


