import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TenantProvider } from './hooks/useTenant';
import { AuthProvider } from './hooks/useAuth';
import { CartProvider } from './hooks/useCart';
import { WishlistProvider } from './hooks/useWishlist';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppRoutes } from './routes/AppRoutes';

const queryClient = new QueryClient();

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TenantProvider>
            <AuthProvider>
              <CartProvider>
                <WishlistProvider>
                  <AppRoutes />
                </WishlistProvider>
              </CartProvider>
            </AuthProvider>
          </TenantProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};
