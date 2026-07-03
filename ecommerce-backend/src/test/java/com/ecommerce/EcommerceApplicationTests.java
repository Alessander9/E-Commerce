package com.ecommerce;

import com.ecommerce.catalog.entity.Category;
import com.ecommerce.catalog.entity.Product;
import com.ecommerce.catalog.entity.ProductPrice;
import com.ecommerce.catalog.repository.CategoryRepository;
import com.ecommerce.catalog.repository.ProductPriceRepository;
import com.ecommerce.catalog.repository.ProductRepository;
import com.ecommerce.security.dto.LoginRequest;
import com.ecommerce.security.dto.RegisterRequest;
import com.ecommerce.security.entity.Role;
import com.ecommerce.security.repository.RoleRepository;
import com.ecommerce.security.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.thymeleaf.TemplateEngine;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class EcommerceApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductPriceRepository productPriceRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockBean
    private JavaMailSender mailSender;

    @MockBean
    private org.thymeleaf.spring6.SpringTemplateEngine templateEngine;

    @MockBean
    private RabbitTemplate rabbitTemplate;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @BeforeEach
    public void setup() {
        jdbcTemplate.execute("TRUNCATE TABLE users, products, categories, audit_logs CASCADE;");
        
        // Seed default roles if not exists
        if (roleRepository.findByName("CLIENT").isEmpty()) {
            roleRepository.save(Role.builder().name("CLIENT").build());
        }
        if (roleRepository.findByName("ADMIN").isEmpty()) {
            roleRepository.save(Role.builder().name("ADMIN").build());
        }
    }

    @Test
    public void testAuthWorkflow() throws Exception {
        // 1. Register Client User
        RegisterRequest registerReq = RegisterRequest.builder()
                .email("client@test.com")
                .password("password123")
                .firstName("Test")
                .lastName("Client")
                .phone("999888777")
                .build();

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isOk());

        // 2. Login User
        LoginRequest loginReq = LoginRequest.builder()
                .email("client@test.com")
                .password("password123")
                .build();

        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andReturn();

        String responseBody = loginResult.getResponse().getContentAsString();
        assertNotNull(responseBody);
    }

    @Test
    public void testCatalogPublicAPI() throws Exception {
        // Create a Category & Product directly in Database
        Category cat = Category.builder()
                .name("Electrónica")
                .slug("electronica")
                .active(true)
                .build();
        categoryRepository.save(cat);

        Product prod = Product.builder()
                .name("Laptop Gamer")
                .slug("laptop-gamer")
                .sku("LTP-GMR-01")
                .active(true)
                .build();
        productRepository.save(prod);

        ProductPrice price = ProductPrice.builder()
                .product(prod)
                .price(BigDecimal.valueOf(3500.00))
                .startDate(LocalDate.now())
                .isActive(true)
                .build();
        productPriceRepository.save(price);

        // Fetch categories
        mockMvc.perform(get("/catalog/categories"))
                .andExpect(status().isOk());

        // Fetch products
        mockMvc.perform(get("/catalog/products"))
                .andExpect(status().isOk());
                
        // Fetch product details
        mockMvc.perform(get("/catalog/products/laptop-gamer"))
                .andExpect(status().isOk());
    }
}
