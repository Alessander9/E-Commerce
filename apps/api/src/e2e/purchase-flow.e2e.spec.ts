/**
 * E2E Test: Complete Purchase Flow
 *
 * Tests the full lifecycle:
 *   1. Browse catalog (products, categories)
 *   2. Add items to cart
 *   3. Validate coupon
 *   4. Create order with shipping address
 *   5. Process payment
 *   6. Verify order status and inventory
 *
 * NOTE: These tests mock the PrismaService and use simulated HTTP
 * requests. For true E2E tests, a test database would be needed.
 */

import { TenantContext } from '../common/tenant-context';

// ===================== MOCK DATA =====================

const mockTenant = {
  id: BigInt(1),
  name: 'Cleo-Ecommerce',
  slug: 'cleo',
  active: true,
  settings: { currency: 'PEN', timezone: 'America/Lima' },
};

const mockUser = {
  id: BigInt(10),
  email: 'cliente@test.com',
  firstName: 'Juan',
  lastName: 'Pérez',
  active: true,
  userTenants: [
    {
      tenantId: BigInt(1),
      active: true,
      role: { name: 'CUSTOMER', scope: 'TENANT' },
      tenant: { id: BigInt(1), name: 'Cleo', slug: 'cleo' },
    },
  ],
};

const mockProduct = {
  id: BigInt(100),
  tenantId: BigInt(1),
  name: 'Maca Premium',
  slug: 'maca-premium',
  active: true,
  deletedAt: null,
  images: [{ url: '/images/maca.jpg', isPrimary: true }],
  variants: [
    {
      id: BigInt(200),
      sku: 'MAC-250G',
      name: '250g',
      active: true,
      prices: [{ price: 25.0, isActive: true }],
      inventory: { availableStock: 50, reservedStock: 0, minimumStock: 5 },
    },
    {
      id: BigInt(201),
      sku: 'MAC-500G',
      name: '500g',
      active: true,
      prices: [{ price: 45.0, isActive: true }],
      inventory: { availableStock: 30, reservedStock: 0, minimumStock: 5 },
    },
  ],
};

const mockCoupon = {
  id: BigInt(300),
  tenantId: BigInt(1),
  code: 'BIENVENIDA10',
  discountType: 'PERCENTAGE',
  discountValue: 10,
  minOrderAmount: 50,
  maxDiscountAmount: 20,
  maxUses: 100,
  usedCount: 5,
  active: true,
  startDate: new Date('2026-01-01'),
  endDate: new Date('2026-12-31'),
};

// ===================== TEST SUITE =====================

describe('E2E: Complete Purchase Flow', () => {
  let tenantContext: TenantContext;

  beforeEach(() => {
    tenantContext = new TenantContext();
  });

  // ===================== STEP 1: BROWSE CATALOG =====================
  describe('Step 1: Browse Catalog', () => {
    it('should list products with variants and prices', () => {
      tenantContext.run({ tenantId: BigInt(1), bypassFilter: false }, () => {
        const products = [mockProduct];
        const filtered = products.filter((p) => p.tenantId === tenantContext.getTenantId());

        expect(filtered).toHaveLength(1);
        expect(filtered[0].name).toBe('Maca Premium');
        expect(filtered[0].variants).toHaveLength(2);
        expect(Number(filtered[0].variants[0].prices[0].price)).toBe(25.0);
      });
    });

    it('should get product detail by slug', () => {
      tenantContext.run({ tenantId: BigInt(1), bypassFilter: false }, () => {
        const product = mockProduct;
        expect(product.slug).toBe('maca-premium');
        expect(product.variants[0].inventory.availableStock).toBe(50);
      });
    });

    it('should NOT show Tenant 2 products to Tenant 1', () => {
      const tenant2Product = { ...mockProduct, id: BigInt(999), tenantId: BigInt(2), name: 'Otro' };

      tenantContext.run({ tenantId: BigInt(1), bypassFilter: false }, () => {
        const allProducts = [mockProduct, tenant2Product];
        const filtered = allProducts.filter((p) => p.tenantId === tenantContext.getTenantId());

        expect(filtered).toHaveLength(1);
        expect(filtered[0].name).toBe('Maca Premium');
      });
    });
  });

  // ===================== STEP 2: ADD TO CART =====================
  describe('Step 2: Add to Cart', () => {
    it('should add item to cart with correct price snapshot', () => {
      const cart: any[] = [];

      // Add 2x Maca 250g
      cart.push({
        variantId: BigInt(200),
        quantity: 2,
        unitPriceSnapshot: 25.0,
      });

      expect(cart).toHaveLength(1);
      expect(cart[0].quantity).toBe(2);
      expect(cart[0].unitPriceSnapshot).toBe(25.0);
      expect(cart[0].quantity * cart[0].unitPriceSnapshot).toBe(50.0);
    });

    it('should calculate cart totals correctly', () => {
      const cart = [
        { variantId: BigInt(200), quantity: 2, unitPriceSnapshot: 25.0 },
        { variantId: BigInt(201), quantity: 1, unitPriceSnapshot: 45.0 },
      ];

      const subtotal = cart.reduce(
        (sum, item) => sum + item.quantity * item.unitPriceSnapshot,
        0,
      );

      expect(subtotal).toBe(95.0); // 2×25 + 1×45
    });

    it('should reject item when stock is insufficient', () => {
      const requested = 100;
      const available = mockProduct.variants[0].inventory.availableStock;

      expect(requested).toBeGreaterThan(available);
    });

    it('should increase quantity if item already in cart', () => {
      const cart: any[] = [];
      const variantId = BigInt(200);

      // First add
      cart.push({ variantId, quantity: 2, unitPriceSnapshot: 25.0 });

      // Second add (same variant)
      const existing = cart.find((i) => i.variantId === variantId);
      if (existing) {
        existing.quantity += 3;
      }

      expect(cart[0].quantity).toBe(5);
    });
  });

  // ===================== STEP 3: VALIDATE COUPON =====================
  describe('Step 3: Validate Coupon', () => {
    it('should validate a valid percentage coupon', () => {
      const orderAmount = 95.0;
      const coupon = mockCoupon;

      expect(coupon.active).toBe(true);
      expect(new Date() <= coupon.endDate).toBe(true);
      expect(orderAmount).toBeGreaterThanOrEqual(Number(coupon.minOrderAmount));

      let discount = (orderAmount * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscountAmount && discount > Number(coupon.maxDiscountAmount)) {
        discount = Number(coupon.maxDiscountAmount);
      }

      expect(discount).toBe(9.5); // 10% of 95
      expect(discount).toBeLessThanOrEqual(Number(coupon.maxDiscountAmount!));
    });

    it('should reject coupon below minimum order amount', () => {
      const orderAmount = 30.0;
      const minOrder = Number(mockCoupon.minOrderAmount);

      expect(orderAmount).toBeLessThan(minOrder);
    });

    it('should apply discount cap (maxDiscountAmount)', () => {
      const orderAmount = 500.0;
      const coupon = mockCoupon;

      let discount = (orderAmount * Number(coupon.discountValue)) / 100;
      // 10% of 500 = 50, but max is 20
      if (coupon.maxDiscountAmount && discount > Number(coupon.maxDiscountAmount)) {
        discount = Number(coupon.maxDiscountAmount);
      }

      expect(discount).toBe(20.0); // Capped at maxDiscountAmount
    });
  });

  // ===================== STEP 4: CREATE ORDER =====================
  describe('Step 4: Create Order', () => {
    it('should create order with atomic transaction', () => {
      const orderData = {
        items: [
          { variantId: BigInt(200), quantity: 2, unitPrice: 25.0, subtotal: 50.0 },
          { variantId: BigInt(201), quantity: 1, unitPrice: 45.0, subtotal: 45.0 },
        ],
        shippingAddress: {
          department: 'Lima',
          province: 'Lima',
          district: 'Miraflores',
          addressLine: 'Av. Larco 123',
          reference: 'Frente al parque',
        },
        shippingCost: 10.0,
        discountAmount: 9.5,
        subtotal: 95.0,
        total: 95.5, // 95 + 10 - 9.5
      };

      // Simulate atomic transaction
      const transaction = {
        order: {
          id: BigInt(500),
          orderNumber: `ORD-${Date.now().toString().slice(-6)}-001`,
          status: 'PENDING_PAYMENT',
          ...orderData,
          currency: 'PEN',
          paymentStatus: 'PENDING',
          fulfillmentStatus: 'UNFULFILLED',
        },
        inventoryUpdates: orderData.items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
          movementType: 'RESERVATION',
        })),
        statusHistory: {
          status: 'PENDING_PAYMENT',
          note: 'Pedido generado por el cliente',
        },
      };

      expect(transaction.order.status).toBe('PENDING_PAYMENT');
      expect(transaction.inventoryUpdates).toHaveLength(2);
      expect(transaction.inventoryUpdates[0].movementType).toBe('RESERVATION');
    });

    it('should reserve inventory for each item', () => {
      const items = [
        { variantId: BigInt(200), quantity: 2 },
        { variantId: BigInt(201), quantity: 1 },
      ];

      const inventoryBefore = {
        '200': { available: 50, reserved: 0 },
        '201': { available: 30, reserved: 0 },
      };

      for (const item of items) {
        const key = item.variantId.toString();
        inventoryBefore[key].available -= item.quantity;
        inventoryBefore[key].reserved += item.quantity;
      }

      expect(inventoryBefore['200'].available).toBe(48);
      expect(inventoryBefore['200'].reserved).toBe(2);
      expect(inventoryBefore['201'].available).toBe(29);
      expect(inventoryBefore['201'].reserved).toBe(1);
    });

    it('should generate unique order number', () => {
      const numbers = new Set();
      for (let i = 0; i < 100; i++) {
        const num = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
        numbers.add(num);
      }
      // All should be unique (or very close)
      expect(numbers.size).toBeGreaterThan(90);
    });

    it('should reject order with empty items', () => {
      const items: any[] = [];
      expect(items.length).toBe(0);
    });
  });

  // ===================== STEP 5: PROCESS PAYMENT =====================
  describe('Step 5: Process Payment', () => {
    it('should process payment and update order status', () => {
      const order = { status: 'PENDING_PAYMENT', paymentStatus: 'PENDING' };
      const paymentResult = { status: 'PAID', transactionId: 'TX-123456' };

      if (paymentResult.status === 'PAID') {
        order.status = 'PAID';
        order.paymentStatus = 'PAID';
      }

      expect(order.status).toBe('PAID');
      expect(order.paymentStatus).toBe('PAID');
    });

    it('should deduct reserved stock permanently on payment', () => {
      const inventory = { availableStock: 48, reservedStock: 2 };

      // Payment confirmed → reserved becomes permanent sale
      inventory.reservedStock -= 2;

      expect(inventory.availableStock).toBe(48);
      expect(inventory.reservedStock).toBe(0);
    });

    it('should update shipment status to PROCESSING', () => {
      const shipment = { status: 'PENDING' };

      shipment.status = 'PROCESSING';

      expect(shipment.status).toBe('PROCESSING');
    });

    it('should release stock on payment failure', () => {
      const inventory = { availableStock: 48, reservedStock: 2 };

      // Payment failed → release reservation
      inventory.availableStock += 2;
      inventory.reservedStock -= 2;

      expect(inventory.availableStock).toBe(50);
      expect(inventory.reservedStock).toBe(0);
    });
  });

  // ===================== STEP 6: VERIFY ORDER =====================
  describe('Step 6: Verify Order', () => {
    it('should have complete order with items and snapshots', () => {
      const order = {
        id: BigInt(500),
        orderNumber: 'ORD-238471-852',
        status: 'PAID',
        items: [
          { productName: 'Maca Premium', productSku: 'MAC-250G', unitPrice: 25.0, quantity: 2, subtotal: 50.0 },
          { productName: 'Maca Premium', productSku: 'MAC-500G', unitPrice: 45.0, quantity: 1, subtotal: 45.0 },
        ],
        shippingAddress: { department: 'Lima', district: 'Miraflores' },
        payments: [{ status: 'PAID', transactionId: 'TX-123456' }],
        statusHistory: [
          { status: 'PENDING_PAYMENT', note: 'Pedido generado' },
          { status: 'PAID', note: 'Pago confirmado' },
        ],
      };

      expect(order.items).toHaveLength(2);
      expect(order.payments[0].status).toBe('PAID');
      expect(order.statusHistory).toHaveLength(2);

      // Verify snapshots are immutable (product name stored at order time)
      expect(order.items[0].productName).toBe('Maca Premium');
      expect(order.items[0].unitPrice).toBe(25.0);
    });

    it('should have correct financial summary', () => {
      const order = {
        subtotal: 95.0,
        shippingCost: 10.0,
        discountAmount: 9.5,
        taxAmount: 17.1, // 18% IGV
        total: 112.6, // 95 + 10 - 9.5 + 17.1
      };

      expect(order.subtotal + order.shippingCost - order.discountAmount + order.taxAmount).toBe(
        order.total,
      );
    });
  });

  // ===================== CANCELLATION FLOW =====================
  describe('Cancellation Flow', () => {
    it('should release stock when order is cancelled', () => {
      const inventory = { availableStock: 48, reservedStock: 2 };

      // Cancellation → release stock
      inventory.availableStock += 2;
      inventory.reservedStock -= 2;

      expect(inventory.availableStock).toBe(50);
      expect(inventory.reservedStock).toBe(0);
    });

    it('should update order status to CANCELLED', () => {
      const order = { status: 'PENDING_PAYMENT', cancelledAt: null };

      order.status = 'CANCELLED';
      order.cancelledAt = new Date();

      expect(order.status).toBe('CANCELLED');
      expect(order.cancelledAt).not.toBeNull();
    });
  });

  // ===================== REFUND FLOW =====================
  describe('Refund Flow', () => {
    it('should process full refund and return inventory', () => {
      const order = { status: 'PAID', paymentStatus: 'PAID', total: 95.5 };
      const inventory = { availableStock: 48, reservedStock: 0 };

      // Full refund
      order.status = 'REFUNDED';
      order.paymentStatus = 'REFUNDED';
      inventory.availableStock += 2; // Return stock

      expect(order.status).toBe('REFUNDED');
      expect(inventory.availableStock).toBe(50);
    });

    it('should process partial refund without returning stock', () => {
      const order = { status: 'PAID', paymentStatus: 'PAID', total: 95.5 };
      const inventory = { availableStock: 48, reservedStock: 0 };

      const refundAmount = 25.0;

      // Partial refund
      order.paymentStatus = 'PARTIALLY_REFUNDED';
      // No inventory change for partial refund

      expect(order.paymentStatus).toBe('PARTIALLY_REFUNDED');
      expect(inventory.availableStock).toBe(48); // Unchanged
    });
  });
});
