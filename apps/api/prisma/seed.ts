import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting PeruCat Store Seed...');

  // 1. Roles (3 Tiers)
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: 'TENANT_ADMIN' },
      update: {
        description: 'Administrador con máximo rol jerárquico y control total del e-commerce PeruCat, catálogo, pedidos y configuración.',
      },
      create: {
        name: 'TENANT_ADMIN',
        scope: 'TENANT',
        description: 'Administrador con máximo rol jerárquico y control total del e-commerce PeruCat, catálogo, pedidos y configuración.',
      },
    }),
    prisma.role.upsert({
      where: { name: 'TENANT_MANAGER' },
      update: {},
      create: {
        name: 'TENANT_MANAGER',
        scope: 'TENANT',
        description: 'Gestor de tienda con permisos de catálogo, inventario y despachos de areneros y arenas sanitarias.',
      },
    }),
    prisma.role.upsert({
      where: { name: 'CUSTOMER' },
      update: {},
      create: {
        name: 'CUSTOMER',
        scope: 'TENANT',
        description: 'Cliente comprador de arenas y accesorios para gatos.',
      },
    }),
  ]);

  const [roleTenantAdmin, roleTenantManager, roleCustomer] = roles;

  // 2. PeruCat Primary Store Tenant
  const perucatTenant = await prisma.tenant.upsert({
    where: { slug: 'perucat' },
    update: {
      name: 'PeruCat',
      primaryColor: '#6A2CFF',
      secondaryColor: '#00B8C9',
      logoUrl: '/IMG/perucat-clasica.jpg',
      description: 'Marca especializada en arena sanitaria para gatos: alta absorción, aglomeración y control de olores. Antes Capsufet.',
    },
    create: {
      name: 'PeruCat',
      slug: 'perucat',
      domain: 'perucat.pe',
      subdomain: 'tienda',
      description: 'Marca especializada en arena sanitaria para gatos: alta absorción, aglomeración y control de olores. Antes Capsufet.',
      logoUrl: '/IMG/perucat-clasica.jpg',
      faviconUrl: '/IMG/perucat-clasica.jpg',
      primaryColor: '#6A2CFF',
      secondaryColor: '#00B8C9',
      status: 'ACTIVE',
      active: true,
      settings: {
        create: {
          currency: 'PEN',
          timezone: 'America/Lima',
          locale: 'es_PE',
          supportEmail: 'contacto@perucat.pe',
          supportPhone: '+51 987 654 321',
          address: 'Av. Las Mascotas 450, Lima, Perú',
          businessHours: {
            weekdays: '08:00 - 18:00',
            saturday: '09:00 - 14:00',
          },
        },
      },
    },
  });

  // Alias cleo slug to PeruCat settings as well for seamless compatibility
  const cleoTenant = await prisma.tenant.upsert({
    where: { slug: 'cleo' },
    update: {
      name: 'PeruCat',
      primaryColor: '#6A2CFF',
      secondaryColor: '#00B8C9',
      logoUrl: '/IMG/perucat-clasica.jpg',
      description: 'Marca especializada en arena sanitaria para gatos: alta absorción, aglomeración y control de olores. Antes Capsufet.',
    },
    create: {
      name: 'PeruCat',
      slug: 'cleo',
      domain: 'cleo.local',
      subdomain: 'cleo',
      description: 'Marca especializada en arena sanitaria para gatos: alta absorción, aglomeración y control de olores. Antes Capsufet.',
      logoUrl: '/IMG/perucat-clasica.jpg',
      faviconUrl: '/IMG/perucat-clasica.jpg',
      primaryColor: '#6A2CFF',
      secondaryColor: '#00B8C9',
      status: 'ACTIVE',
      active: true,
      settings: {
        create: {
          currency: 'PEN',
          timezone: 'America/Lima',
          locale: 'es_PE',
          supportEmail: 'contacto@perucat.pe',
          supportPhone: '+51 987 654 321',
          address: 'Av. Las Mascotas 450, Lima, Perú',
        },
      },
    },
  });

  console.log(`✅ Tenant PeruCat ready (ID: ${perucatTenant.id}, Slug: perucat)`);

  // 3. Users
  const passwordHash = await bcrypt.hash('admin123', 10);
  const clientPasswordHash = await bcrypt.hash('client123', 10);

  // PeruCat Admin
  await prisma.user.upsert({
    where: { email: 'admin@perucat.pe' },
    update: {},
    create: {
      email: 'admin@perucat.pe',
      password: passwordHash,
      firstName: 'Administrador',
      lastName: 'PeruCat',
      phone: '+51 988 888 888',
      active: true,
      userTenants: {
        create: [
          { tenantId: perucatTenant.id, roleId: roleTenantAdmin.id },
          { tenantId: cleoTenant.id, roleId: roleTenantAdmin.id },
        ],
      },
    },
  });

  // Legacy alias email admin@cleo.com
  await prisma.user.upsert({
    where: { email: 'admin@cleo.com' },
    update: {},
    create: {
      email: 'admin@cleo.com',
      password: passwordHash,
      firstName: 'Administrador',
      lastName: 'PeruCat',
      phone: '+51 988 888 888',
      active: true,
      userTenants: {
        create: [
          { tenantId: perucatTenant.id, roleId: roleTenantAdmin.id },
          { tenantId: cleoTenant.id, roleId: roleTenantAdmin.id },
        ],
      },
    },
  });

  // PeruCat Manager
  await prisma.user.upsert({
    where: { email: 'manager@perucat.pe' },
    update: {},
    create: {
      email: 'manager@perucat.pe',
      password: passwordHash,
      firstName: 'Gestor',
      lastName: 'Operativo',
      phone: '+51 988 777 666',
      active: true,
      userTenants: {
        create: [
          { tenantId: perucatTenant.id, roleId: roleTenantManager.id },
          { tenantId: cleoTenant.id, roleId: roleTenantManager.id },
        ],
      },
    },
  });

  await prisma.user.upsert({
    where: { email: 'manager@cleo.com' },
    update: {},
    create: {
      email: 'manager@cleo.com',
      password: passwordHash,
      firstName: 'Gestor',
      lastName: 'Operativo',
      phone: '+51 988 777 666',
      active: true,
      userTenants: {
        create: [
          { tenantId: perucatTenant.id, roleId: roleTenantManager.id },
          { tenantId: cleoTenant.id, roleId: roleTenantManager.id },
        ],
      },
    },
  });

  // Customer
  await prisma.user.upsert({
    where: { email: 'cliente@perucat.pe' },
    update: {},
    create: {
      email: 'cliente@perucat.pe',
      password: clientPasswordHash,
      firstName: 'Alessander',
      lastName: 'Gatuno',
      phone: '+51 977 777 777',
      active: true,
      userTenants: {
        create: [
          { tenantId: perucatTenant.id, roleId: roleCustomer.id },
          { tenantId: cleoTenant.id, roleId: roleCustomer.id },
        ],
      },
      addresses: {
        create: {
          department: 'Lima',
          province: 'Lima',
          district: 'Miraflores',
          addressLine: 'Av. Pardo 550, Dpto 802',
          reference: 'Frente al parque Kennedy',
          postalCode: '15074',
          isDefault: true,
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: 'cliente@cleo.com' },
    update: {},
    create: {
      email: 'cliente@cleo.com',
      password: clientPasswordHash,
      firstName: 'Alessander',
      lastName: 'Gatuno',
      phone: '+51 977 777 777',
      active: true,
      userTenants: {
        create: [
          { tenantId: perucatTenant.id, roleId: roleCustomer.id },
          { tenantId: cleoTenant.id, roleId: roleCustomer.id },
        ],
      },
    },
  });

  console.log('✅ PeruCat Users & Roles seeded');

  // 4. Product Options for PeruCat (Weight / Size)
  const setupTenantCatalog = async (targetTenant: typeof perucatTenant) => {
    const optWeight = await prisma.productOption.upsert({
      where: { tenantId_name: { tenantId: targetTenant.id, name: 'Presentación' } },
      update: {},
      create: {
        tenantId: targetTenant.id,
        name: 'Presentación',
        displayType: 'BUTTON',
        displayOrder: 1,
        values: {
          create: [
            { value: '5kg', label: 'Bolsa 5 Kg', displayOrder: 1 },
            { value: '10kg', label: 'Bolsa 10 Kg', displayOrder: 2 },
            { value: '15kg', label: 'Bolsa 15 Kg (Max Ahorro)', displayOrder: 3 },
          ],
        },
      },
      include: { values: true },
    });

    // 5. Categories for PeruCat
    const catAglomerante = await prisma.category.upsert({
      where: { tenantId_slug: { tenantId: targetTenant.id, slug: 'arenas-aglomerantes' } },
      update: {
        name: 'Arenas Aglomerantes',
        description: 'Bentonita 100% natural con aglomeración instantánea y terrones ultra compactos.',
        imageUrl: '/IMG/perucat-clasica.jpg',
      },
      create: {
        tenantId: targetTenant.id,
        name: 'Arenas Aglomerantes',
        slug: 'arenas-aglomerantes',
        description: 'Bentonita 100% natural con aglomeración instantánea y terrones ultra compactos.',
        imageUrl: '/IMG/perucat-clasica.jpg',
        displayOrder: 1,
      },
    });

    const catCarbon = await prisma.category.upsert({
      where: { tenantId_slug: { tenantId: targetTenant.id, slug: 'control-olores' } },
      update: {
        name: 'Control de Olores & Carbón Activo',
        description: 'Fórmula enriquecida con carbón activado para neutralizar olores las 24 horas.',
        imageUrl: '/IMG/perucat-carbon.jpg',
      },
      create: {
        tenantId: targetTenant.id,
        name: 'Control de Olores & Carbón Activo',
        slug: 'control-olores',
        description: 'Fórmula enriquecida con carbón activado para neutralizar olores las 24 horas.',
        imageUrl: '/IMG/perucat-carbon.jpg',
        displayOrder: 2,
      },
    });

    const catAromas = await prisma.category.upsert({
      where: { tenantId_slug: { tenantId: targetTenant.id, slug: 'aromas-y-fragancias' } },
      update: {
        name: 'Aromas & Fragancias Relajantes',
        description: 'Lavanda y flores silvestres con microcápsulas activadas al contacto.',
        imageUrl: '/IMG/perucat-lavanda.jpg',
      },
      create: {
        tenantId: targetTenant.id,
        name: 'Aromas & Fragancias Relajantes',
        slug: 'aromas-y-fragancias',
        description: 'Lavanda y flores silvestres con microcápsulas activadas al contacto.',
        imageUrl: '/IMG/perucat-lavanda.jpg',
        displayOrder: 3,
      },
    });

    const catAccesorios = await prisma.category.upsert({
      where: { tenantId_slug: { tenantId: targetTenant.id, slug: 'accesorios-areneros' } },
      update: {
        name: 'Areneros & Accesorios',
        description: 'Palas ergonómicas de alta precisión, tapetes atrapa-arena y areneros higiénicos.',
        imageUrl: '/IMG/perucat-aglomeracion.jpg',
      },
      create: {
        tenantId: targetTenant.id,
        name: 'Areneros & Accesorios',
        slug: 'accesorios-areneros',
        description: 'Palas ergonómicas de alta precisión, tapetes atrapa-arena y areneros higiénicos.',
        imageUrl: '/IMG/perucat-aglomeracion.jpg',
        displayOrder: 4,
      },
    });

    // 6. Products
    const productsData = [
      {
        name: 'PeruCat Clásica Aglomerante Ultra Absorción',
        slug: 'perucat-clasica-aglomerante',
        baseSku: 'PC-CLAS',
        brand: 'PeruCat',
        description: 'Arena sanitaria aglomerante para gatos elaborada con bentonita de alta pureza. Ofrece máxima capacidad de absorción y aglomeración instantánea, formando terrones firmes y fáciles de retirar con la pala. 99.5% libre de polvo. (Antes Capsufet Clásica).',
        shortDescription: 'Alta absorción, aglomeración rápida y fácil limpieza del arenero.',
        categoryId: catAglomerante.id,
        imageUrl: '/IMG/perucat-clasica.jpg',
        featured: true,
        variants: [
          { sku: 'PC-CLAS-5KG', name: '5kg', price: 28.00, compareAtPrice: 34.00, stock: 80, optVal: optWeight.values.find(v => v.value === '5kg') },
          { sku: 'PC-CLAS-10KG', name: '10kg', price: 52.00, compareAtPrice: 62.00, stock: 65, optVal: optWeight.values.find(v => v.value === '10kg') },
          { sku: 'PC-CLAS-15KG', name: '15kg', price: 74.00, compareAtPrice: 89.00, stock: 40, optVal: optWeight.values.find(v => v.value === '15kg') },
        ],
      },
      {
        name: 'PeruCat Carbón Activo Max Control de Olores',
        slug: 'perucat-carbon-activo-max-control',
        baseSku: 'PC-CARB',
        brand: 'PeruCat',
        description: 'Fórmula avanzada con partículas de carbón activado diseñadas para atrapar y neutralizar los olores más fuertes de orina y heces. Ideal para hogares con más de un gato o espacios cerrados. No irrita las patitas.',
        shortDescription: 'Neutralización superior de olores 24/7 con carbón activado.',
        categoryId: catCarbon.id,
        imageUrl: '/IMG/perucat-carbon.jpg',
        featured: true,
        variants: [
          { sku: 'PC-CARB-5KG', name: '5kg', price: 34.00, compareAtPrice: 40.00, stock: 70, optVal: optWeight.values.find(v => v.value === '5kg') },
          { sku: 'PC-CARB-10KG', name: '10kg', price: 62.00, compareAtPrice: 72.00, stock: 50, optVal: optWeight.values.find(v => v.value === '10kg') },
        ],
      },
      {
        name: 'PeruCat Aroma Lavanda Silvestre Anti-Estrés',
        slug: 'perucat-aroma-lavanda-silvestre',
        baseSku: 'PC-LAV',
        brand: 'PeruCat',
        description: 'Arena sanitaria aglomerante con suave fragancia natural a lavanda silvestre que se libera gradualmente con el uso. Brinda una agradable sensación de frescura en el hogar sin perturbar el sensible olfato felino.',
        shortDescription: 'Aroma fresco y sutil de lavanda con aglomeración perfecta.',
        categoryId: catAromas.id,
        imageUrl: '/IMG/perucat-lavanda.jpg',
        featured: true,
        variants: [
          { sku: 'PC-LAV-5KG', name: '5kg', price: 32.00, compareAtPrice: 38.00, stock: 60, optVal: optWeight.values.find(v => v.value === '5kg') },
          { sku: 'PC-LAV-10KG', name: '10kg', price: 58.00, compareAtPrice: 68.00, stock: 45, optVal: optWeight.values.find(v => v.value === '10kg') },
        ],
      },
      {
        name: 'Pala Sanitaria Ergonómica de Precisión PeruCat',
        slug: 'pala-sanitaria-ergonomica-perucat',
        baseSku: 'PC-PALA',
        brand: 'PeruCat',
        description: 'Pala higiénica con ranuras calibradas para colar la arena limpia y retirar exclusivamente los terrones aglomerados. Ahorra hasta un 30% de arena por mes gracias a su diseño ergonómico y resistente.',
        shortDescription: 'Ranuras de máxima precisión para ahorro de arena y limpieza rápida.',
        categoryId: catAccesorios.id,
        imageUrl: '/IMG/perucat-aglomeracion.jpg',
        featured: true,
        variants: [
          { sku: 'PC-PALA-STD', name: 'Estándar', price: 16.00, compareAtPrice: 22.00, stock: 90, optVal: undefined },
        ],
      },
    ];

    for (const p of productsData) {
      const product = await prisma.product.upsert({
        where: { tenantId_slug: { tenantId: targetTenant.id, slug: p.slug } },
        update: {
          name: p.name,
          brand: p.brand,
          description: p.description,
          shortDescription: p.shortDescription,
        },
        create: {
          tenantId: targetTenant.id,
          name: p.name,
          slug: p.slug,
          baseSku: p.baseSku,
          brand: p.brand,
          description: p.description,
          shortDescription: p.shortDescription,
          hasVariants: true,
          featured: p.featured,
          active: true,
          productCategories: {
            create: {
              categoryId: p.categoryId,
            },
          },
          images: {
            create: {
              url: p.imageUrl,
              altText: p.name,
              isPrimary: true,
              displayOrder: 1,
            },
          },
        },
      });

      for (const v of p.variants) {
        const variant = await prisma.productVariant.upsert({
          where: { productId_sku: { productId: product.id, sku: v.sku } },
          update: {},
          create: {
            productId: product.id,
            sku: v.sku,
            name: v.name,
            active: true,
            prices: {
              create: {
                price: v.price,
                compareAtPrice: v.compareAtPrice,
                currency: 'PEN',
                isActive: true,
              },
            },
            inventory: {
              create: {
                availableStock: v.stock,
                reservedStock: 0,
                minimumStock: 5,
              },
            },
            variantValues: v.optVal
              ? {
                  create: {
                    optionValueId: v.optVal.id,
                  },
                }
              : undefined,
          },
        });
      }
    }

    // Shipping & Coupons
    await prisma.shippingZone.upsert({
      where: { tenantId_name: { tenantId: targetTenant.id, name: 'Lima Metropolitana' } },
      update: {},
      create: {
        tenantId: targetTenant.id,
        name: 'Lima Metropolitana',
        active: true,
        rates: {
          create: [
            { weightMin: 0, weightMax: 10, price: 10.00, currency: 'PEN' },
            { weightMin: 10, weightMax: 30, price: 16.00, currency: 'PEN' },
          ],
        },
      },
    });

    await prisma.coupon.upsert({
      where: { tenantId_code: { tenantId: targetTenant.id, code: 'PERUCAT20' } },
      update: {},
      create: {
        tenantId: targetTenant.id,
        code: 'PERUCAT20',
        discountType: 'PERCENTAGE',
        discountValue: 20.00,
        maxDiscountAmount: 50.00,
        minOrderAmount: 30.00,
        maxUses: 2000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        active: true,
      },
    });

    await prisma.coupon.upsert({
      where: { tenantId_code: { tenantId: targetTenant.id, code: 'ENVIOGRATIS' } },
      update: {},
      create: {
        tenantId: targetTenant.id,
        code: 'ENVIOGRATIS',
        discountType: 'FIXED',
        discountValue: 12.00,
        maxDiscountAmount: 12.00,
        minOrderAmount: 99.00,
        maxUses: 1000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        active: true,
      },
    });
  };

  await setupTenantCatalog(perucatTenant);
  await setupTenantCatalog(cleoTenant);

  console.log('🎉 PeruCat E-Commerce Database successfully initialized!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
