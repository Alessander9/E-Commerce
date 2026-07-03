package com.ecommerce;

import com.ecommerce.security.entity.Role;
import com.ecommerce.security.entity.User;
import com.ecommerce.security.repository.RoleRepository;
import com.ecommerce.security.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.HashSet;
import java.util.Set;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class SecurityRoleIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @MockBean
    private JavaMailSender mailSender;

    @MockBean
    private SpringTemplateEngine templateEngine;

    @MockBean
    private RabbitTemplate rabbitTemplate;

    @BeforeEach
    public void setup() {
        // Truncate tables using cascade to clean up test database reliably
        jdbcTemplate.execute("TRUNCATE TABLE users, products, categories, audit_logs CASCADE;");
        
        // Seed roles
        if (roleRepository.findByName("CLIENT").isEmpty()) {
            roleRepository.save(Role.builder().name("CLIENT").build());
        }
        if (roleRepository.findByName("ADMIN").isEmpty()) {
            roleRepository.save(Role.builder().name("ADMIN").build());
        }
    }

    private User createAndSaveUser(String email, String roleName) {
        Role role = roleRepository.findByName(roleName).orElseThrow();
        User user = User.builder()
                .email(email)
                .passwordHash("hashed")
                .firstName("Test")
                .lastName("User")
                .active(true)
                .roles(new HashSet<>(Set.of(role)))
                .build();
        return userRepository.save(user);
    }

    private UsernamePasswordAuthenticationToken getAuthToken(User user) {
        return new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
    }

    // ==========================================
    // ANONYMOUS / INVITADO ROLE TESTS
    // ==========================================

    @Test
    public void testPublicEndpointsAccess_AsAnonymous() throws Exception {
        // Public endpoints should return 200 OK
        mockMvc.perform(get("/catalog/products"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/catalog/categories"))
                .andExpect(status().isOk());

        // Calculations endpoint is public (returns 400 due to empty body, but NOT 403 Forbidden)
        mockMvc.perform(post("/shipping/rates/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testProtectedClientEndpointsAccess_AsAnonymous() throws Exception {
        // Authenticated-only endpoints should return 403 Forbidden for anonymous users in stateless setup
        mockMvc.perform(get("/cart"))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/orders"))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/wishlist"))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testAdminEndpointsAccess_AsAnonymous() throws Exception {
        // Admin endpoints should return 403 Forbidden for anonymous users
        mockMvc.perform(get("/admin/orders"))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/admin/audit-logs"))
                .andExpect(status().isForbidden());
    }

    // ==========================================
    // CLIENT ROLE TESTS (ROLE_CLIENT)
    // ==========================================

    @Test
    public void testClientEndpointsAccess_AsClient() throws Exception {
        User client = createAndSaveUser("client@test.com", "CLIENT");
        UsernamePasswordAuthenticationToken authToken = getAuthToken(client);

        // CLIENT has access to authenticated endpoints
        mockMvc.perform(get("/cart")
                .with(authentication(authToken)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/wishlist")
                .with(authentication(authToken)))
                .andExpect(status().isOk());
    }

    @Test
    public void testAdminEndpointsAccess_AsClient() throws Exception {
        User client = createAndSaveUser("client@test.com", "CLIENT");
        UsernamePasswordAuthenticationToken authToken = getAuthToken(client);

        // CLIENT should be blocked from admin endpoints with 403 Forbidden
        mockMvc.perform(get("/admin/orders")
                .with(authentication(authToken)))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/admin/audit-logs")
                .with(authentication(authToken)))
                .andExpect(status().isForbidden());
    }

    // ==========================================
    // ADMIN ROLE TESTS (ROLE_ADMIN)
    // ==========================================

    @Test
    public void testAdminEndpointsAccess_AsAdmin() throws Exception {
        User admin = createAndSaveUser("admin@test.com", "ADMIN");
        UsernamePasswordAuthenticationToken authToken = getAuthToken(admin);

        // ADMIN should have access to admin endpoints
        mockMvc.perform(get("/admin/orders")
                .with(authentication(authToken)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/admin/audit-logs")
                .with(authentication(authToken)))
                .andExpect(status().isOk());
    }

    @Test
    public void testClientEndpointsAccess_AsAdmin() throws Exception {
        User admin = createAndSaveUser("admin@test.com", "ADMIN");
        UsernamePasswordAuthenticationToken authToken = getAuthToken(admin);

        // ADMIN should also be able to access general authenticated endpoints
        mockMvc.perform(get("/cart")
                .with(authentication(authToken)))
                .andExpect(status().isOk());
    }
}
