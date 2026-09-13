import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar, Footer, WhatsAppButton } from '@/components/layout';
import { CartDrawer } from '@/components/cart/CartDrawer';

export const StorefrontLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FC]">
      {/* 1. Header / Navbar */}
      <Navbar />

      {/* 2. Main Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* 3. Slide-over Cart Drawer & Floating WhatsApp */}
      <CartDrawer />
      <WhatsAppButton />

      {/* 4. Footer Section */}
      <Footer />
    </div>
  );
};
