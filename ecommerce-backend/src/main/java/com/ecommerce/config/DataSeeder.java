package com.ecommerce.config;

import com.ecommerce.catalog.entity.Category;
import com.ecommerce.catalog.entity.Inventory;
import com.ecommerce.catalog.entity.Product;
import com.ecommerce.catalog.entity.ProductPrice;
import com.ecommerce.catalog.repository.CategoryRepository;
import com.ecommerce.catalog.repository.InventoryRepository;
import com.ecommerce.catalog.repository.ProductPriceRepository;
import com.ecommerce.catalog.repository.ProductRepository;
import com.ecommerce.security.entity.Role;
import com.ecommerce.security.entity.User;
import com.ecommerce.security.repository.RoleRepository;
import com.ecommerce.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@Profile("!test")
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductPriceRepository productPriceRepository;
    private final InventoryRepository inventoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedRoles();
        seedUsers();
        seedCatalog();
    }

    private void seedRoles() {
        if (roleRepository.findByName("ADMIN").isEmpty()) {
            roleRepository.save(Role.builder().name("ADMIN").build());
        }
        if (roleRepository.findByName("CLIENT").isEmpty()) {
            roleRepository.save(Role.builder().name("CLIENT").build());
        }
    }

    private void seedUsers() {
        if (userRepository.findByEmail("admin@allamarasuperfoods.pe").isEmpty()) {
            Role adminRole = roleRepository.findByName("ADMIN").orElseThrow();
            User admin = User.builder()
                    .email("admin@allamarasuperfoods.pe")
                    .passwordHash(passwordEncoder.encode("Admin2026!"))
                    .firstName("Admin")
                    .lastName("Allmara")
                    .active(true)
                    .roles(new HashSet<>(Set.of(adminRole)))
                    .build();
            userRepository.save(admin);
        }

        if (userRepository.findByEmail("cliente@allamarasuperfoods.pe").isEmpty()) {
            Role clientRole = roleRepository.findByName("CLIENT").orElseThrow();
            User client = User.builder()
                    .email("cliente@allamarasuperfoods.pe")
                    .passwordHash(passwordEncoder.encode("Cliente2026!"))
                    .firstName("Cliente")
                    .lastName("Allmara")
                    .active(true)
                    .roles(new HashSet<>(Set.of(clientRole)))
                    .build();
            userRepository.save(client);
        }
    }

    private void seedCatalog() {
        if (categoryRepository.count() == 0) {
            Category superfoods = categoryRepository.save(Category.builder().name("Superfoods").slug("superfoods").active(true).build());
            Category frutosSecos = categoryRepository.save(Category.builder().name("Frutos Secos").slug("frutos-secos").active(true).build());
            Category miel = categoryRepository.save(Category.builder().name("Miel de Abeja").slug("miel-de-abeja").active(true).build());
            Category suplementos = categoryRepository.save(Category.builder().name("Suplementos").slug("suplementos").active(true).build());

            createProduct("Miel de Abeja Orgánica", "miel-de-abeja-organica", "MEL-ORG-01", 35.00, 50, 0.500, miel);
            createProduct("Maca Amarilla Orgánica", "maca-amarilla-organica", "MAC-AMR-01", 28.00, 100, 0.250, superfoods);
            createProduct("Mix Frutos Secos Premium", "mix-frutos-secos-premium", "MIX-PRM-01", 42.00, 80, 0.400, frutosSecos);
            createProduct("Harina de Camu Camu", "harina-de-camu-camu", "CAM-CAM-01", 45.00, 30, 0.150, superfoods);
            createProduct("Aceite de Coco Virgen", "aceite-de-coco-virgen", "COC-VRG-01", 39.00, 40, 0.500, suplementos);
            createProduct("Semillas de Chía Orgánica", "semillas-de-chia-organica", "CHI-ORG-01", 18.00, 120, 0.300, superfoods);
        }
    }

    private void createProduct(String name, String slug, String sku, double priceVal, int stock, double weight, Category category) {
        Product product = Product.builder()
                .name(name)
                .slug(slug)
                .sku(sku)
                .active(true)
                .weight(BigDecimal.valueOf(weight))
                .categories(new HashSet<>(List.of(category)))
                .build();
        product = productRepository.save(product);

        ProductPrice price = ProductPrice.builder()
                .product(product)
                .price(BigDecimal.valueOf(priceVal))
                .startDate(LocalDate.now())
                .isActive(true)
                .build();
        productPriceRepository.save(price);

        Inventory inventory = Inventory.builder()
                .product(product)
                .availableStock(stock)
                .reservedStock(0)
                .updatedAt(OffsetDateTime.now())
                .build();
        inventoryRepository.save(inventory);
    }
}
