import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // Public Routes (Catalog & Auth)
  { 
    path: '', 
    loadComponent: () => import('./features/catalog/pages/home/home').then(m => m.HomeComponent),
    data: {
      title: 'ALLMARA SUPERFOODS | Productos naturales, superfoods y bienestar',
      description: 'Compra superfoods, frutos secos, miel, suplementos y snacks naturales en ALLMARA SUPERFOODS. Atención rápida por WhatsApp y envíos en Perú.',
      robots: 'index,follow',
      ogType: 'website'
    }
  },
  { 
    path: 'productos', 
    loadComponent: () => import('./features/catalog/pages/product-list/product-list').then(m => m.ProductListComponent),
    data: {
      title: 'Nuestros Productos | ALLMARA SUPERFOODS',
      description: 'Explora el catálogo completo de ALLMARA SUPERFOODS: superfoods, miel, frutos secos, aceites y productos naturales para comprar por WhatsApp.',
      robots: 'index,follow',
      ogType: 'website'
    }
  },
  { 
    path: 'products/:slug', 
    loadComponent: () => import('./features/catalog/pages/product-detail/product-detail').then(m => m.ProductDetailComponent),
    data: {
      title: 'Detalle de producto | ALLMARA SUPERFOODS',
      description: 'Conoce el detalle, precio y beneficios de cada producto natural disponible en ALLMARA SUPERFOODS.',
      robots: 'index,follow',
      ogType: 'product'
    }
  },
  { 
    path: 'login', 
    loadComponent: () => import('./features/auth/pages/login/login').then(m => m.LoginComponent),
    data: {
      title: 'Iniciar sesión | ALLMARA SUPERFOODS',
      description: 'Accede a tu cuenta en ALLMARA SUPERFOODS para gestionar pedidos, carrito y seguimiento.',
      robots: 'noindex,nofollow'
    }
  },
  { 
    path: 'register', 
    loadComponent: () => import('./features/auth/pages/register/register').then(m => m.RegisterComponent),
    data: {
      title: 'Crear cuenta | ALLMARA SUPERFOODS',
      description: 'Regístrate en ALLMARA SUPERFOODS para comprar más rápido y tener seguimiento de tus pedidos.',
      robots: 'noindex,nofollow'
    }
  },
  { 
    path: 'password-reset', 
    loadComponent: () => import('./features/auth/pages/password-reset/password-reset').then(m => m.PasswordResetComponent),
    data: {
      title: 'Recuperar contraseña | ALLMARA SUPERFOODS',
      description: 'Recupera el acceso a tu cuenta de ALLMARA SUPERFOODS de forma segura.',
      robots: 'noindex,nofollow'
    }
  },
  { 
    path: 'politicas', 
    loadComponent: () => import('./features/static-pages/policies/policies').then(m => m.PoliciesComponent),
    data: {
      title: 'Políticas y Términos Legales | ALLMARA SUPERFOODS',
      description: 'Consulta los Términos y Condiciones, Políticas de Privacidad y Políticas de Devoluciones de ALLMARA SUPERFOODS.',
      robots: 'index,follow',
      ogType: 'website'
    }
  },

  // Authenticated Customer Routes
  { 
    path: '', 
    canActivate: [authGuard], 
    children: [
      { 
        path: 'cart', 
        loadComponent: () => import('./features/cart-wishlist/pages/cart-detail/cart-detail').then(m => m.CartDetailComponent),
        data: {
          title: 'Mi carrito | ALLMARA SUPERFOODS',
          description: 'Revisa tus productos seleccionados y continúa tu compra en ALLMARA SUPERFOODS.',
          robots: 'noindex,nofollow'
        }
      },
      { 
        path: 'wishlist', 
        loadComponent: () => import('./features/cart-wishlist/pages/wishlist-detail/wishlist-detail').then(m => m.WishlistDetailComponent),
        data: {
          title: 'Favoritos | ALLMARA SUPERFOODS',
          description: 'Guarda productos naturales para comprarlos después en ALLMARA SUPERFOODS.',
          robots: 'noindex,nofollow'
        }
      },
      { 
        path: 'checkout', 
        loadComponent: () => import('./features/checkout-order/pages/checkout-form/checkout-form').then(m => m.CheckoutFormComponent),
        data: {
          title: 'Finalizar compra | ALLMARA SUPERFOODS',
          description: 'Completa tu pedido en ALLMARA SUPERFOODS con un flujo rápido y seguro.',
          robots: 'noindex,nofollow'
        }
      },
      { 
        path: 'checkout/payment/:orderId', 
        loadComponent: () => import('./features/checkout-order/pages/payment-culqi/payment-culqi').then(m => m.PaymentCulqiComponent),
        data: {
          title: 'Pago del pedido | ALLMARA SUPERFOODS',
          description: 'Realiza el pago de tu pedido en ALLMARA SUPERFOODS de manera segura.',
          robots: 'noindex,nofollow'
        }
      }
    ]
  },

  { 
    path: '', 
    canActivate: [authGuard], 
    children: [
      {
        path: 'orders',
        loadComponent: () => import('./features/checkout-order/pages/order-history/order-history').then(m => m.OrderHistoryComponent),
        data: {
          title: 'Mis pedidos | ALLMARA SUPERFOODS',
          description: 'Consulta tu historial de pedidos realizados en ALLMARA SUPERFOODS.',
          robots: 'noindex,nofollow'
        }
      },
      {
        path: 'orders/:orderNumber',
        loadComponent: () => import('./features/checkout-order/pages/order-detail/order-detail').then(m => m.OrderDetailComponent),
        data: {
          title: 'Detalle del pedido | ALLMARA SUPERFOODS',
          description: 'Revisa el estado y detalle de tu pedido en ALLMARA SUPERFOODS.',
          robots: 'noindex,nofollow'
        }
      },
    ]
  },

  // Admin Routes
  { 
    path: 'admin', 
    canActivate: [authGuard, adminGuard], 
    loadComponent: () => import('./features/admin/pages/dashboard/dashboard').then(m => m.DashboardComponent),
    data: {
      title: 'Panel admin | ALLMARA SUPERFOODS',
      description: 'Administración interna de productos, pedidos y usuarios de ALLMARA SUPERFOODS.',
      robots: 'noindex,nofollow'
    },
    children: [
      { path: 'products', loadComponent: () => import('./features/admin/pages/admin-products/admin-products').then(m => m.AdminProductsComponent) },
      { path: 'categories', loadComponent: () => import('./features/admin/pages/admin-categories/admin-categories').then(m => m.AdminCategoriesComponent) },
      { path: 'orders', loadComponent: () => import('./features/admin/pages/admin-orders/admin-orders').then(m => m.AdminOrdersComponent) },
      { path: 'shipments', loadComponent: () => import('./features/admin/pages/admin-shipments/admin-shipments').then(m => m.AdminShipmentsComponent) },
      { path: 'coupons', loadComponent: () => import('./features/admin/pages/admin-coupons/admin-coupons').then(m => m.AdminCouponsComponent) },
      { path: 'users', loadComponent: () => import('./features/admin/pages/admin-users/admin-users').then(m => m.AdminUsersComponent) },
      { path: 'audit', loadComponent: () => import('./features/admin/pages/admin-audit/admin-audit').then(m => m.AdminAuditComponent) },
    ]
  },

  { path: '**', redirectTo: '' }
];
