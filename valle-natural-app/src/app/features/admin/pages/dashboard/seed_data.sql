-- SEED DATA FOR ALLMARA SUPERFOODS
BEGIN;

-- 1. Insert Categories
INSERT INTO categories (name, slug, description, active) VALUES
('Superalimentos en Polvo', 'superalimentos-en-polvo', 'Polvos orgánicos de alta densidad nutricional', true),
('Granos y Semillas', 'granos-y-semillas', 'Granos y semillas andinas ricas en proteínas y omega-3', true),
('Frutos Secos y Deshidratados', 'frutos-secos-y-deshidratados', 'Frutos secos y frutas deshidratadas sin azúcar añadida', true),
('Aceites Orgánicos', 'aceites-organicos', 'Aceites prensados en frío y grasas saludables', true);

-- 2. Insert Products
INSERT INTO products (name, slug, description, sku, weight, active) VALUES
('Maca Roja Orgánica Gelatinizada en Polvo 250g', 'maca-roja-organica-gelatinizada-en-polvo-250g', 'Maca roja cultivada de forma orgánica en los Andes peruanos, ideal para la energía y balance.', 'ALL-MACA-ROJA-250', 0.250, true),
('Cacao Orgánico en Polvo Premium 200g', 'cacao-organico-en-polvo-premium-200g', 'Cacao orgánico puro de Cusco, seleccionado y molido finamente con aroma intenso.', 'ALL-CACAO-POWDER-200', 0.200, true),
('Quinua Real Orgánica Tricolor 500g', 'quinua-real-organica-tricolor-500g', 'Mezcla de quinua orgánica blanca, roja y negra de alta calidad, rica en aminoácidos.', 'ALL-QUINUA-TRI-500', 0.500, true),
('Semillas de Chía Orgánica Premium 250g', 'semillas-de-chia-organica-premium-250g', 'Semillas de chía orgánicas seleccionadas, fuente vegetal excelente de Omega 3 y fibra.', 'ALL-CHIA-PREMIUM-250', 0.250, true),
('Aguaymanto Deshidratado Orgánico 150g', 'aguaymanto-deshidratado-organico-150g', 'Aguaymanto deshidratado orgánico, fruta ácida y dulce rica en antioxidantes y vitamina C.', 'ALL-AGUAYMANTO-150', 0.150, true),
('Aceite de Coco Orgánico Virgen Extra 500ml', 'aceite-de-coco-organico-virgen-extra-500ml', 'Aceite de coco orgánico prensado en frío, virgen extra, ideal para cocina y cuidado personal.', 'ALL-COCO-OIL-500', 0.500, true);

-- 3. Insert Product Prices
INSERT INTO product_prices (product_id, price, start_date, is_active)
SELECT id, 28.50, '2026-01-01'::date, true FROM products WHERE sku = 'ALL-MACA-ROJA-250' UNION ALL
SELECT id, 24.00, '2026-01-01'::date, true FROM products WHERE sku = 'ALL-CACAO-POWDER-200' UNION ALL
SELECT id, 15.00, '2026-01-01'::date, true FROM products WHERE sku = 'ALL-QUINUA-TRI-500' UNION ALL
SELECT id, 12.50, '2026-01-01'::date, true FROM products WHERE sku = 'ALL-CHIA-PREMIUM-250' UNION ALL
SELECT id, 18.00, '2026-01-01'::date, true FROM products WHERE sku = 'ALL-AGUAYMANTO-150' UNION ALL
SELECT id, 35.00, '2026-01-01'::date, true FROM products WHERE sku = 'ALL-COCO-OIL-500';

-- 4. Insert Inventory
INSERT INTO inventory (product_id, available_stock, reserved_stock)
SELECT id, 50, 0 FROM products WHERE sku = 'ALL-MACA-ROJA-250' UNION ALL
SELECT id, 75, 0 FROM products WHERE sku = 'ALL-CACAO-POWDER-200' UNION ALL
SELECT id, 100, 0 FROM products WHERE sku = 'ALL-QUINUA-TRI-500' UNION ALL
SELECT id, 80, 0 FROM products WHERE sku = 'ALL-CHIA-PREMIUM-250' UNION ALL
SELECT id, 40, 0 FROM products WHERE sku = 'ALL-AGUAYMANTO-150' UNION ALL
SELECT id, 30, 0 FROM products WHERE sku = 'ALL-COCO-OIL-500';

-- 5. Associate Product Categories
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.sku = 'ALL-MACA-ROJA-250' AND c.slug = 'superalimentos-en-polvo' UNION ALL
SELECT p.id, c.id FROM products p, categories c WHERE p.sku = 'ALL-CACAO-POWDER-200' AND c.slug = 'superalimentos-en-polvo' UNION ALL
SELECT p.id, c.id FROM products p, categories c WHERE p.sku = 'ALL-QUINUA-TRI-500' AND c.slug = 'granos-y-semillas' UNION ALL
SELECT p.id, c.id FROM products p, categories c WHERE p.sku = 'ALL-CHIA-PREMIUM-250' AND c.slug = 'granos-y-semillas' UNION ALL
SELECT p.id, c.id FROM products p, categories c WHERE p.sku = 'ALL-AGUAYMANTO-150' AND c.slug = 'frutos-secos-y-deshidratados' UNION ALL
SELECT p.id, c.id FROM products p, categories c WHERE p.sku = 'ALL-COCO-OIL-500' AND c.slug = 'aceites-organicos';

-- 6. Insert Coupons
INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_uses, used_count, start_date, active) VALUES
('ALLMARA10', 'PERCENTAGE', 10.00, 50.00, 200, 5, '2026-01-01'::date, true),
('SUPERFOODS5', 'FIXED', 5.00, 30.00, 100, 2, '2026-01-01'::date, true),
('BIENVENIDA20', 'PERCENTAGE', 20.00, 0.00, NULL, 0, '2026-06-01'::date, true);

-- 7. Insert Orders and store order references
-- Order 1: PAID, S/ 61.30 (User 7)
INSERT INTO orders (order_number, user_id, status, subtotal, shipping_cost, discount_amount, total, created_at, updated_at)
VALUES ('ALL-20260610-00001', 7, 'PAID', 57.00, 10.00, 5.70, 61.30, '2026-06-10 10:15:00-05:00', '2026-06-10 10:15:00-05:00');

INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
SELECT 
  (SELECT id FROM orders WHERE order_number = 'ALL-20260610-00001'),
  id, name, 28.50, 2, 57.00
FROM products WHERE sku = 'ALL-MACA-ROJA-250';

INSERT INTO payments (order_id, provider, transaction_id, amount, currency, status, paid_at, created_at)
VALUES (
  (SELECT id FROM orders WHERE order_number = 'ALL-20260610-00001'),
  'CULQI', 'chr_test_1abc987654321', 61.30, 'PEN', 'PAID', '2026-06-10 10:16:30-05:00', '2026-06-10 10:15:10-05:00'
);

-- Order 2: PENDING, S/ 34.00 (User 7)
INSERT INTO orders (order_number, user_id, status, subtotal, shipping_cost, discount_amount, total, created_at, updated_at)
VALUES ('ALL-20260611-00001', 7, 'PENDING', 24.00, 10.00, 0.00, 34.00, '2026-06-11 08:30:00-05:00', '2026-06-11 08:30:00-05:00');

INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
SELECT 
  (SELECT id FROM orders WHERE order_number = 'ALL-20260611-00001'),
  id, name, 24.00, 1, 24.00
FROM products WHERE sku = 'ALL-CACAO-POWDER-200';

INSERT INTO payments (order_id, provider, transaction_id, amount, currency, status, paid_at, created_at)
VALUES (
  (SELECT id FROM orders WHERE order_number = 'ALL-20260611-00001'),
  'CULQI', 'chr_test_2def123456789', 34.00, 'PEN', 'PENDING', NULL, '2026-06-11 08:30:05-05:00'
);

-- Order 3: DELIVERED, S/ 76.50 (User 5)
INSERT INTO orders (order_number, user_id, status, subtotal, shipping_cost, discount_amount, total, created_at, updated_at)
VALUES ('ALL-20260611-00002', 5, 'DELIVERED', 85.00, 0.00, 8.50, 76.50, '2026-06-11 11:00:00-05:00', '2026-06-11 11:00:00-05:00');

INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
SELECT 
  (SELECT id FROM orders WHERE order_number = 'ALL-20260611-00002'),
  id, name, 35.00, 2, 70.00
FROM products WHERE sku = 'ALL-COCO-OIL-500';

INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
SELECT 
  (SELECT id FROM orders WHERE order_number = 'ALL-20260611-00002'),
  id, name, 15.00, 1, 15.00
FROM products WHERE sku = 'ALL-QUINUA-TRI-500';

INSERT INTO payments (order_id, provider, transaction_id, amount, currency, status, paid_at, created_at)
VALUES (
  (SELECT id FROM orders WHERE order_number = 'ALL-20260611-00002'),
  'CULQI', 'chr_test_3ghi112233445', 76.50, 'PEN', 'PAID', '2026-06-11 11:02:15-05:00', '2026-06-11 11:00:15-05:00'
);

-- Order 4: CANCELLED, S/ 45.00 (User 7)
INSERT INTO orders (order_number, user_id, status, subtotal, shipping_cost, discount_amount, total, created_at, updated_at)
VALUES ('ALL-20260611-00003', 7, 'CANCELLED', 35.00, 10.00, 0.00, 45.00, '2026-06-11 13:45:00-05:00', '2026-06-11 13:45:00-05:00');

INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
SELECT 
  (SELECT id FROM orders WHERE order_number = 'ALL-20260611-00003'),
  id, name, 35.00, 1, 35.00
FROM products WHERE sku = 'ALL-COCO-OIL-500';

INSERT INTO payments (order_id, provider, transaction_id, amount, currency, status, paid_at, created_at)
VALUES (
  (SELECT id FROM orders WHERE order_number = 'ALL-20260611-00003'),
  'CULQI', 'chr_test_4jkl998877665', 45.00, 'PEN', 'CANCELLED', NULL, '2026-06-11 13:45:10-05:00'
);

-- Order 5: PAID, S/ 73.50 (User 5)
INSERT INTO orders (order_number, user_id, status, subtotal, shipping_cost, discount_amount, total, created_at, updated_at)
VALUES ('ALL-20260611-00004', 5, 'PAID', 68.50, 10.00, 5.00, 73.50, '2026-06-11 15:20:00-05:00', '2026-06-11 15:20:00-05:00');

INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
SELECT 
  (SELECT id FROM orders WHERE order_number = 'ALL-20260611-00004'),
  id, name, 28.50, 1, 28.50
FROM products WHERE sku = 'ALL-MACA-ROJA-250';

INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
SELECT 
  (SELECT id FROM orders WHERE order_number = 'ALL-20260611-00004'),
  id, name, 24.00, 1, 24.00
FROM products WHERE sku = 'ALL-CACAO-POWDER-200';

INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
SELECT 
  (SELECT id FROM orders WHERE order_number = 'ALL-20260611-00004'),
  id, name, 18.00, 1, 18.00
FROM products WHERE sku = 'ALL-AGUAYMANTO-150';

INSERT INTO payments (order_id, provider, transaction_id, amount, currency, status, paid_at, created_at)
VALUES (
  (SELECT id FROM orders WHERE order_number = 'ALL-20260611-00004'),
  'CULQI', 'chr_test_5mno556677889', 73.50, 'PEN', 'PAID', '2026-06-11 15:22:45-05:00', '2026-06-11 15:20:15-05:00'
);

-- 8. Add Audit Logs
INSERT INTO audit_logs (user_id, action, entity, entity_id, new_value, ip_address) VALUES
(6, 'PRODUCT_CREATED', 'products', (SELECT id FROM products WHERE sku = 'ALL-MACA-ROJA-250'), '{"sku": "ALL-MACA-ROJA-250", "name": "Maca Roja"}', '127.0.0.1'),
(6, 'PRODUCT_CREATED', 'products', (SELECT id FROM products WHERE sku = 'ALL-CACAO-POWDER-200'), '{"sku": "ALL-CACAO-POWDER-200", "name": "Cacao Orgánico"}', '127.0.0.1'),
(6, 'COUPON_CREATED', 'coupons', (SELECT id FROM coupons WHERE code = 'ALLMARA10'), '{"code": "ALLMARA10", "value": 10}', '127.0.0.1');

COMMIT;
