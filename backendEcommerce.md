# backendEcommerce — Planeamiento Backend

**Stack:** Java 21 · Spring Boot 3 · Spring Security · JWT · Spring Data JPA · RabbitMQ · PostgreSQL  
**Versión:** 1.0  
**Base de datos de referencia:** EcommerceBD.md (30 tablas)

---

## Tabla de Contenidos

1. [Estructura del Proyecto](#1-estructura-del-proyecto)
2. [Dependencias Maven](#2-dependencias-maven)
3. [Configuración Base](#3-configuración-base)
4. [Módulo 1 — Seguridad y Autenticación](#4-módulo-1--seguridad-y-autenticación)
5. [Módulo 2 — Catálogo](#5-módulo-2--catálogo)
6. [Módulo 3 — Carrito de Compras](#6-módulo-3--carrito-de-compras)
7. [Módulo 4 — Pedidos](#7-módulo-4--pedidos)
8. [Módulo 5 — Pagos con Culqi](#8-módulo-5--pagos-con-culqi)
9. [Módulo 6 — Envíos y Tracking](#9-módulo-6--envíos-y-tracking)
10. [Módulo 7 — Cupones y Promociones](#10-módulo-7--cupones-y-promociones)
11. [Módulo 8 — Wishlist](#11-módulo-8--wishlist)
12. [Módulo 9 — Notificaciones con RabbitMQ](#12-módulo-9--notificaciones-con-rabbitmq)
13. [Módulo 10 — Auditoría](#13-módulo-10--auditoría)
14. [Manejo Global de Errores](#14-manejo-global-de-errores)
15. [Resumen de Endpoints](#15-resumen-de-endpoints)
16. [Orden de Implementación](#16-orden-de-implementación)

---

## 1. Estructura del Proyecto

```
ecommerce-backend/
├── src/
│   └── main/
│       ├── java/com/ecommerce/
│       │   ├── EcommerceApplication.java
│       │   │
│       │   ├── config/
│       │   │   ├── SecurityConfig.java
│       │   │   ├── JwtConfig.java
│       │   │   ├── RabbitMQConfig.java
│       │   │   ├── CulqiConfig.java
│       │   │   └── CorsConfig.java
│       │   │
│       │   ├── shared/
│       │   │   ├── exception/
│       │   │   │   ├── GlobalExceptionHandler.java
│       │   │   │   ├── ResourceNotFoundException.java
│       │   │   │   ├── BusinessException.java
│       │   │   │   └── UnauthorizedException.java
│       │   │   ├── response/
│       │   │   │   ├── ApiResponse.java
│       │   │   │   └── PageResponse.java
│       │   │   └── audit/
│       │   │       └── AuditService.java
│       │   │
│       │   ├── security/
│       │   │   ├── entity/
│       │   │   │   ├── User.java
│       │   │   │   ├── Role.java
│       │   │   │   ├── UserRole.java
│       │   │   │   ├── RefreshToken.java
│       │   │   │   └── PasswordResetToken.java
│       │   │   ├── repository/
│       │   │   │   ├── UserRepository.java
│       │   │   │   ├── RoleRepository.java
│       │   │   │   ├── RefreshTokenRepository.java
│       │   │   │   └── PasswordResetTokenRepository.java
│       │   │   ├── dto/
│       │   │   │   ├── RegisterRequest.java
│       │   │   │   ├── LoginRequest.java
│       │   │   │   ├── AuthResponse.java
│       │   │   │   ├── RefreshTokenRequest.java
│       │   │   │   └── PasswordResetRequest.java
│       │   │   ├── service/
│       │   │   │   ├── AuthService.java
│       │   │   │   ├── JwtService.java
│       │   │   │   ├── RefreshTokenService.java
│       │   │   │   └── UserDetailsServiceImpl.java
│       │   │   ├── filter/
│       │   │   │   └── JwtAuthenticationFilter.java
│       │   │   └── controller/
│       │   │       └── AuthController.java
│       │   │
│       │   ├── user/
│       │   │   ├── entity/
│       │   │   │   └── Address.java
│       │   │   ├── repository/
│       │   │   │   └── AddressRepository.java
│       │   │   ├── dto/
│       │   │   │   ├── UserProfileResponse.java
│       │   │   │   ├── UpdateProfileRequest.java
│       │   │   │   ├── AddressRequest.java
│       │   │   │   └── AddressResponse.java
│       │   │   ├── service/
│       │   │   │   └── UserService.java
│       │   │   └── controller/
│       │   │       └── UserController.java
│       │   │
│       │   ├── catalog/
│       │   │   ├── entity/
│       │   │   │   ├── Category.java
│       │   │   │   ├── Product.java
│       │   │   │   ├── ProductImage.java
│       │   │   │   ├── ProductPrice.java
│       │   │   │   └── Inventory.java
│       │   │   ├── repository/
│       │   │   │   ├── CategoryRepository.java
│       │   │   │   ├── ProductRepository.java
│       │   │   │   ├── ProductImageRepository.java
│       │   │   │   ├── ProductPriceRepository.java
│       │   │   │   └── InventoryRepository.java
│       │   │   ├── dto/
│       │   │   │   ├── CategoryRequest.java
│       │   │   │   ├── CategoryResponse.java
│       │   │   │   ├── ProductRequest.java
│       │   │   │   ├── ProductResponse.java
│       │   │   │   ├── ProductSummaryResponse.java
│       │   │   │   ├── ProductFilterRequest.java
│       │   │   │   ├── ProductPriceRequest.java
│       │   │   │   └── InventoryUpdateRequest.java
│       │   │   ├── service/
│       │   │   │   ├── CategoryService.java
│       │   │   │   ├── ProductService.java
│       │   │   │   └── InventoryService.java
│       │   │   └── controller/
│       │   │       ├── CategoryController.java
│       │   │       ├── ProductController.java
│       │   │       └── AdminProductController.java
│       │   │
│       │   ├── cart/
│       │   │   ├── entity/
│       │   │   │   ├── Cart.java
│       │   │   │   └── CartItem.java
│       │   │   ├── repository/
│       │   │   │   ├── CartRepository.java
│       │   │   │   └── CartItemRepository.java
│       │   │   ├── dto/
│       │   │   │   ├── CartResponse.java
│       │   │   │   ├── CartItemRequest.java
│       │   │   │   └── CartItemResponse.java
│       │   │   ├── service/
│       │   │   │   └── CartService.java
│       │   │   └── controller/
│       │   │       └── CartController.java
│       │   │
│       │   ├── order/
│       │   │   ├── entity/
│       │   │   │   ├── Order.java
│       │   │   │   ├── OrderItem.java
│       │   │   │   ├── OrderShippingAddress.java
│       │   │   │   └── OrderStatusHistory.java
│       │   │   ├── repository/
│       │   │   │   ├── OrderRepository.java
│       │   │   │   ├── OrderItemRepository.java
│       │   │   │   └── OrderStatusHistoryRepository.java
│       │   │   ├── dto/
│       │   │   │   ├── CreateOrderRequest.java
│       │   │   │   ├── OrderResponse.java
│       │   │   │   ├── OrderSummaryResponse.java
│       │   │   │   ├── OrderItemResponse.java
│       │   │   │   └── UpdateOrderStatusRequest.java
│       │   │   ├── service/
│       │   │   │   └── OrderService.java
│       │   │   └── controller/
│       │   │       ├── OrderController.java
│       │   │       └── AdminOrderController.java
│       │   │
│       │   ├── payment/
│       │   │   ├── entity/
│       │   │   │   └── Payment.java
│       │   │   ├── repository/
│       │   │   │   └── PaymentRepository.java
│       │   │   ├── dto/
│       │   │   │   ├── CreatePaymentRequest.java
│       │   │   │   ├── PaymentResponse.java
│       │   │   │   └── CulqiChargeRequest.java
│       │   │   ├── service/
│       │   │   │   ├── PaymentService.java
│       │   │   │   └── CulqiService.java
│       │   │   └── controller/
│       │   │       └── PaymentController.java
│       │   │
│       │   ├── shipping/
│       │   │   ├── entity/
│       │   │   │   ├── ShippingZone.java
│       │   │   │   ├── ShippingRate.java
│       │   │   │   ├── Shipment.java
│       │   │   │   └── ShipmentTracking.java
│       │   │   ├── repository/
│       │   │   │   ├── ShippingZoneRepository.java
│       │   │   │   ├── ShippingRateRepository.java
│       │   │   │   ├── ShipmentRepository.java
│       │   │   │   └── ShipmentTrackingRepository.java
│       │   │   ├── dto/
│       │   │   │   ├── ShippingRateCalculateRequest.java
│       │   │   │   ├── ShippingRateResponse.java
│       │   │   │   ├── ShipmentResponse.java
│       │   │   │   ├── ShipmentTrackingResponse.java
│       │   │   │   └── UpdateTrackingRequest.java
│       │   │   ├── service/
│       │   │   │   ├── ShippingService.java
│       │   │   │   └── ShalomService.java
│       │   │   └── controller/
│       │   │       ├── ShippingController.java
│       │   │       └── AdminShippingController.java
│       │   │
│       │   ├── coupon/
│       │   │   ├── entity/
│       │   │   │   ├── Coupon.java
│       │   │   │   └── CouponRedemption.java
│       │   │   ├── repository/
│       │   │   │   ├── CouponRepository.java
│       │   │   │   └── CouponRedemptionRepository.java
│       │   │   ├── dto/
│       │   │   │   ├── CouponRequest.java
│       │   │   │   ├── CouponResponse.java
│       │   │   │   └── ValidateCouponRequest.java
│       │   │   ├── service/
│       │   │   │   └── CouponService.java
│       │   │   └── controller/
│       │   │       ├── CouponController.java
│       │   │       └── AdminCouponController.java
│       │   │
│       │   ├── wishlist/
│       │   │   ├── entity/
│       │   │   │   ├── Wishlist.java
│       │   │   │   └── WishlistItem.java
│       │   │   ├── repository/
│       │   │   │   ├── WishlistRepository.java
│       │   │   │   └── WishlistItemRepository.java
│       │   │   ├── dto/
│       │   │   │   └── WishlistResponse.java
│       │   │   ├── service/
│       │   │   │   └── WishlistService.java
│       │   │   └── controller/
│       │   │       └── WishlistController.java
│       │   │
│       │   ├── notification/
│       │   │   ├── entity/
│       │   │   │   └── Notification.java
│       │   │   ├── repository/
│       │   │   │   └── NotificationRepository.java
│       │   │   ├── dto/
│       │   │   │   └── NotificationEvent.java
│       │   │   ├── service/
│       │   │   │   ├── NotificationService.java
│       │   │   │   └── EmailService.java
│       │   │   └── messaging/
│       │   │       ├── NotificationProducer.java
│       │   │       └── NotificationConsumer.java
│       │   │
│       │   └── audit/
│       │       ├── entity/
│       │       │   └── AuditLog.java
│       │       ├── repository/
│       │       │   └── AuditLogRepository.java
│       │       └── service/
│       │           └── AuditLogService.java
│       │
│       └── resources/
│           ├── application.yml
│           ├── application-dev.yml
│           ├── application-prod.yml
│           └── templates/
│               ├── email-order-created.html
│               ├── email-order-shipped.html
│               ├── email-payment-confirmed.html
│               └── email-password-reset.html
│
└── pom.xml
```

---

## 2. Dependencias Maven

```xml
<!-- pom.xml -->
<project>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.0</version>
    </parent>

    <properties>
        <java.version>21</java.version>
        <jjwt.version>0.12.5</jjwt.version>
    </properties>

    <dependencies>

        <!-- ── Web ───────────────────────────────────────────── -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- ── Seguridad ─────────────────────────────────────── -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>

        <!-- ── JWT ───────────────────────────────────────────── -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>${jjwt.version}</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>

        <!-- ── JPA + PostgreSQL ──────────────────────────────── -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- ── Validación ────────────────────────────────────── -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- ── RabbitMQ ───────────────────────────────────────── -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-amqp</artifactId>
        </dependency>

        <!-- ── Email ─────────────────────────────────────────── -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-mail</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-thymeleaf</artifactId>
        </dependency>
        <dependency>
            <groupId>nz.net.ultraq.thymeleaf</groupId>
            <artifactId>thymeleaf-layout-dialect</artifactId>
        </dependency>

        <!-- ── HTTP Client (para Culqi y Shalom API) ─────────── -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-webflux</artifactId>
        </dependency>

        <!-- ── Lombok ────────────────────────────────────────── -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- ── MapStruct ─────────────────────────────────────── -->
        <dependency>
            <groupId>org.mapstruct</groupId>
            <artifactId>mapstruct</artifactId>
            <version>1.5.5.Final</version>
        </dependency>
        <dependency>
            <groupId>org.mapstruct</groupId>
            <artifactId>mapstruct-processor</artifactId>
            <version>1.5.5.Final</version>
            <scope>provided</scope>
        </dependency>

        <!-- ── Tests ─────────────────────────────────────────── -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>

    </dependencies>
</project>
```

---

## 3. Configuración Base

### application.yml

```yaml
spring:
  application:
    name: ecommerce-backend

  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/ecommerce_db}
    username: ${DB_USER:postgres}
    password: ${DB_PASSWORD:postgres}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000

  jpa:
    hibernate:
      ddl-auto: validate          # nunca create/update en producción
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
        default_batch_fetch_size: 20

  rabbitmq:
    host: ${RABBITMQ_HOST:localhost}
    port: ${RABBITMQ_PORT:5672}
    username: ${RABBITMQ_USER:guest}
    password: ${RABBITMQ_PASSWORD:guest}
    virtual-host: /

  mail:
    host: ${MAIL_HOST:smtp.gmail.com}
    port: ${MAIL_PORT:587}
    username: ${MAIL_USER}
    password: ${MAIL_PASSWORD}
    properties:
      mail.smtp.auth: true
      mail.smtp.starttls.enable: true

app:
  jwt:
    secret: ${JWT_SECRET}            # mínimo 256 bits en producción
    access-token-expiration: 900000  # 15 minutos en ms
    refresh-token-expiration: 604800000  # 7 días en ms

  culqi:
    secret-key: ${CULQI_SECRET_KEY}
    public-key: ${CULQI_PUBLIC_KEY}
    base-url: https://api.culqi.com/v2

  shalom:
    base-url: ${SHALOM_API_URL}
    api-key: ${SHALOM_API_KEY}

  cors:
    allowed-origins: ${CORS_ORIGINS:http://localhost:4200}

server:
  port: 8080
  servlet:
    context-path: /api/v1
```

### RabbitMQConfig.java

```java
@Configuration
public class RabbitMQConfig {

    public static final String NOTIFICATION_QUEUE    = "notification.queue";
    public static final String NOTIFICATION_EXCHANGE = "notification.exchange";
    public static final String NOTIFICATION_ROUTING  = "notification.routing.key";

    @Bean
    public Queue notificationQueue() {
        return QueueBuilder.durable(NOTIFICATION_QUEUE).build();
    }

    @Bean
    public DirectExchange notificationExchange() {
        return new DirectExchange(NOTIFICATION_EXCHANGE);
    }

    @Bean
    public Binding notificationBinding() {
        return BindingBuilder
            .bind(notificationQueue())
            .to(notificationExchange())
            .with(NOTIFICATION_ROUTING);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory factory) {
        RabbitTemplate template = new RabbitTemplate(factory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
```

### CorsConfig.java

```java
@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(allowedOrigins.split(",")));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
```

---

## 4. Módulo 1 — Seguridad y Autenticación

### Entidades JPA

```java
// User.java
@Entity
@Table(name = "users")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class User implements UserDetails {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    private String phone;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Address> addresses = new ArrayList<>();

    // UserDetails implementation
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
            .map(r -> new SimpleGrantedAuthority("ROLE_" + r.getName()))
            .collect(Collectors.toSet());
    }

    @Override public String getPassword()  { return passwordHash; }
    @Override public String getUsername()  { return email; }
    @Override public boolean isEnabled()   { return active && deletedAt == null; }

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
```

### JwtService.java

```java
@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.access-token-expiration}")
    private long accessTokenExpiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    public String generateAccessToken(UserDetails user) {
        return Jwts.builder()
            .subject(user.getUsername())
            .claim("roles", user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()))
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
            .signWith(getSigningKey())
            .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public boolean isTokenValid(String token, UserDetails user) {
        return extractUsername(token).equals(user.getUsername())
            && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private <T> T extractClaim(String token, Function<Claims, T> resolver) {
        Claims claims = Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
        return resolver.apply(claims);
    }
}
```

### SecurityConfig.java

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;
    private final UserDetailsServiceImpl userDetailsService;
    private final CorsConfigurationSource corsConfigurationSource;

    private static final String[] PUBLIC_ROUTES = {
        "/auth/**",
        "/catalog/products/**",
        "/catalog/categories/**",
        "/shipping/rates/calculate"
    };

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(c -> c.configurationSource(corsConfigurationSource))
            .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(PUBLIC_ROUTES).permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
```

### AuthService.java

```java
@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final NotificationProducer notificationProducer;
    private final AuditLogService auditLogService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("El email ya está registrado");
        }

        Role clientRole = roleRepository.findByName("CLIENT")
            .orElseThrow(() -> new ResourceNotFoundException("Rol CLIENT no encontrado"));

        User user = User.builder()
            .email(request.getEmail().toLowerCase())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .phone(request.getPhone())
            .active(true)
            .roles(Set.of(clientRole))
            .build();

        userRepository.save(user);

        notificationProducer.sendNotification(NotificationEvent.builder()
            .userId(user.getId())
            .type("WELCOME")
            .channel("EMAIL")
            .payload(Map.of("firstName", user.getFirstName()))
            .build());

        auditLogService.log(null, "USER_REGISTERED", "users", user.getId(), null,
            Map.of("email", user.getEmail()));

        String accessToken  = jwtService.generateAccessToken(user);
        String refreshToken = refreshTokenService.create(user);
        return new AuthResponse(accessToken, refreshToken);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
            .orElseThrow(() -> new UnauthorizedException("Credenciales inválidas"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            auditLogService.log(user.getId(), "LOGIN_FAILED", "users", user.getId(), null, null);
            throw new UnauthorizedException("Credenciales inválidas");
        }

        if (!user.isEnabled()) {
            throw new UnauthorizedException("Cuenta desactivada");
        }

        auditLogService.log(user.getId(), "USER_LOGIN", "users", user.getId(), null, null);

        String accessToken  = jwtService.generateAccessToken(user);
        String refreshToken = refreshTokenService.create(user);
        return new AuthResponse(accessToken, refreshToken);
    }

    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken stored = refreshTokenRepository.findByToken(request.getRefreshToken())
            .orElseThrow(() -> new UnauthorizedException("Refresh token inválido"));

        if (stored.isRevoked() || stored.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new UnauthorizedException("Refresh token expirado o revocado");
        }

        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        String newAccess  = jwtService.generateAccessToken(stored.getUser());
        String newRefresh = refreshTokenService.create(stored.getUser());
        return new AuthResponse(newAccess, newRefresh);
    }

    public void logout(String refreshToken) {
        refreshTokenRepository.findByToken(refreshToken)
            .ifPresent(t -> { t.setRevoked(true); refreshTokenRepository.save(t); });
    }
}
```

### AuthController.java

```java
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(CREATED)
            .body(ApiResponse.success(authService.register(request)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.login(request)));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.refresh(request)));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody RefreshTokenRequest request) {
        authService.logout(request.getRefreshToken());
        return ResponseEntity.noContent().build();
    }
}
```

---

## 5. Módulo 2 — Catálogo

### Entidad Product.java

```java
@Entity
@Table(name = "products")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
@SQLRestriction("deleted_at IS NULL")   // filtro global de soft delete
public class Product {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, unique = true)
    private String sku;

    private BigDecimal weight;
    private BigDecimal height;
    private BigDecimal width;
    private BigDecimal length;

    @Column(name = "meta_title")
    private String metaTitle;

    @Column(name = "meta_description")
    private String metaDescription;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @ManyToMany
    @JoinTable(
        name = "product_categories",
        joinColumns = @JoinColumn(name = "product_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<Category> categories = new HashSet<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<ProductImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private List<ProductPrice> prices = new ArrayList<>();

    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL)
    private Inventory inventory;

    @PrePersist
    protected void onCreate() { createdAt = updatedAt = OffsetDateTime.now(); }

    @PreUpdate
    protected void onUpdate() { updatedAt = OffsetDateTime.now(); }
}
```

### ProductRepository.java

```java
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySlug(String slug);
    boolean existsBySku(String sku);

    // Búsqueda con filtros dinámicos
    @Query("""
        SELECT p FROM Product p
        JOIN p.categories c
        WHERE (:categoryId IS NULL OR c.id = :categoryId)
          AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')))
          AND p.active = true
        ORDER BY p.createdAt DESC
        """)
    Page<Product> findWithFilters(
        @Param("categoryId") Integer categoryId,
        @Param("search") String search,
        Pageable pageable
    );

    // Productos con precio activo (evita N+1)
    @Query("""
        SELECT DISTINCT p FROM Product p
        LEFT JOIN FETCH p.images
        LEFT JOIN FETCH p.prices pp
        WHERE p.id = :id AND pp.isActive = true
        """)
    Optional<Product> findByIdWithDetails(@Param("id") Long id);
}
```

### InventoryService.java

```java
@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    /**
     * Reserva stock al agregar al carrito.
     * Usa SELECT FOR UPDATE para evitar condiciones de carrera.
     */
    @Transactional
    public void reserveStock(Long productId, int quantity) {
        Inventory inv = inventoryRepository.findByProductIdForUpdate(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Inventario no encontrado"));

        if (inv.getAvailableStock() < quantity) {
            throw new BusinessException("Stock insuficiente para el producto: " + productId);
        }

        inv.setAvailableStock(inv.getAvailableStock() - quantity);
        inv.setReservedStock(inv.getReservedStock() + quantity);
        inventoryRepository.save(inv);
    }

    /**
     * Confirma la venta al completar el pago.
     */
    @Transactional
    public void confirmSale(Long productId, int quantity) {
        Inventory inv = inventoryRepository.findByProductIdForUpdate(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Inventario no encontrado"));

        inv.setReservedStock(inv.getReservedStock() - quantity);
        inventoryRepository.save(inv);
    }

    /**
     * Libera reserva si el pedido es cancelado.
     */
    @Transactional
    public void releaseReservation(Long productId, int quantity) {
        Inventory inv = inventoryRepository.findByProductIdForUpdate(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Inventario no encontrado"));

        inv.setAvailableStock(inv.getAvailableStock() + quantity);
        inv.setReservedStock(Math.max(0, inv.getReservedStock() - quantity));
        inventoryRepository.save(inv);
    }
}
```

### InventoryRepository.java (fragmento clave)

```java
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Inventory i WHERE i.product.id = :productId")
    Optional<Inventory> findByProductIdForUpdate(@Param("productId") Long productId);
}
```

### AdminProductController.java

```java
@RestController
@RequestMapping("/admin/products")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController {

    private final ProductService productService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> create(
            @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.status(CREATED)
            .body(ApiResponse.success(productService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(ApiResponse.success(productService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.softDelete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/inventory")
    public ResponseEntity<ApiResponse<Void>> updateInventory(
            @PathVariable Long id,
            @Valid @RequestBody InventoryUpdateRequest request) {
        productService.updateInventory(id, request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/{id}/prices")
    public ResponseEntity<ApiResponse<Void>> addPrice(
            @PathVariable Long id,
            @Valid @RequestBody ProductPriceRequest request) {
        productService.addPrice(id, request);
        return ResponseEntity.status(CREATED).body(ApiResponse.success(null));
    }
}
```

---

## 6. Módulo 3 — Carrito de Compras

### CartService.java

```java
@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final ProductPriceRepository priceRepository;

    public CartResponse getOrCreateCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
            .orElseGet(() -> cartRepository.save(
                Cart.builder().userId(userId).build()
            ));
        return toResponse(cart);
    }

    public CartResponse addItem(Long userId, CartItemRequest request) {
        Cart cart = cartRepository.findByUserId(userId)
            .orElseGet(() -> cartRepository.save(
                Cart.builder().userId(userId).build()
            ));

        Product product = productRepository.findById(request.getProductId())
            .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

        Inventory inventory = inventoryRepository.findByProductIdForUpdate(product.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Sin inventario"));

        if (inventory.getAvailableStock() < request.getQuantity()) {
            throw new BusinessException("Stock insuficiente");
        }

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId())
            .map(existing -> {
                existing.setQuantity(existing.getQuantity() + request.getQuantity());
                return existing;
            })
            .orElse(CartItem.builder()
                .cart(cart)
                .product(product)
                .quantity(request.getQuantity())
                .build());

        cartItemRepository.save(item);
        return toResponse(cart);
    }

    public CartResponse updateItem(Long userId, Long productId, int quantity) {
        Cart cart = cartRepository.findByUserIdOrThrow(userId);

        if (quantity <= 0) {
            cartItemRepository.deleteByCartIdAndProductId(cart.getId(), productId);
        } else {
            CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Item no encontrado en carrito"));
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        return toResponse(cart);
    }

    public void clearCart(Long userId) {
        cartRepository.findByUserId(userId)
            .ifPresent(c -> cartItemRepository.deleteAllByCartId(c.getId()));
    }

    private CartResponse toResponse(Cart cart) {
        // Mapear cart + items + precio activo de cada producto
        // ...
    }
}
```

### CartController.java

```java
@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(cartService.getOrCreateCart(user.getId())));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addItem(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CartItemRequest request) {
        return ResponseEntity.ok(ApiResponse.success(cartService.addItem(user.getId(), request)));
    }

    @PatchMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateItem(
            @AuthenticationPrincipal User user,
            @PathVariable Long productId,
            @RequestParam int quantity) {
        return ResponseEntity.ok(ApiResponse.success(
            cartService.updateItem(user.getId(), productId, quantity)));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal User user) {
        cartService.clearCart(user.getId());
        return ResponseEntity.noContent().build();
    }
}
```

---

## 7. Módulo 4 — Pedidos

### OrderService.java

```java
@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final InventoryService inventoryService;
    private final ShippingService shippingService;
    private final CouponService couponService;
    private final NotificationProducer notificationProducer;
    private final AuditLogService auditLogService;

    public OrderResponse createFromCart(Long userId, CreateOrderRequest request) {

        // 1. Obtener carrito
        Cart cart = cartRepository.findByUserIdOrThrow(userId);
        if (cart.getItems().isEmpty()) {
            throw new BusinessException("El carrito está vacío");
        }

        // 2. Calcular subtotal
        BigDecimal subtotal = calculateSubtotal(cart.getItems());

        // 3. Calcular envío
        BigDecimal shippingCost = shippingService.calculateCost(
            request.getAddressId(), cart.getItems());

        // 4. Aplicar cupón (si hay)
        BigDecimal discount = BigDecimal.ZERO;
        if (request.getCouponCode() != null) {
            discount = couponService.validateAndCalculate(
                request.getCouponCode(), userId, subtotal);
        }

        BigDecimal total = subtotal.add(shippingCost).subtract(discount);

        // 5. Crear pedido
        Order order = Order.builder()
            .orderNumber(generateOrderNumber())
            .userId(userId)
            .status("PENDING")
            .subtotal(subtotal)
            .shippingCost(shippingCost)
            .discountAmount(discount)
            .total(total)
            .build();

        orderRepository.save(order);

        // 6. Snapshot de dirección
        Address address = addressRepository.findByIdAndUserId(request.getAddressId(), userId)
            .orElseThrow(() -> new ResourceNotFoundException("Dirección no encontrada"));

        orderShippingAddressRepository.save(OrderShippingAddress.from(order, address));

        // 7. Crear líneas del pedido y reservar stock
        for (CartItem item : cart.getItems()) {
            BigDecimal unitPrice = priceRepository.findActivePrice(item.getProduct().getId())
                .orElseThrow(() -> new BusinessException("Sin precio activo para producto"))
                .getPrice();

            orderItemRepository.save(OrderItem.builder()
                .order(order)
                .product(item.getProduct())
                .productName(item.getProduct().getName())
                .unitPrice(unitPrice)
                .quantity(item.getQuantity())
                .subtotal(unitPrice.multiply(BigDecimal.valueOf(item.getQuantity())))
                .build());

            inventoryService.reserveStock(item.getProduct().getId(), item.getQuantity());
        }

        // 8. Registrar historial de estado
        addStatusHistory(order, null, "PENDING", "Pedido creado");

        // 9. Redimir cupón si existe
        if (request.getCouponCode() != null) {
            couponService.redeem(request.getCouponCode(), userId, order.getId());
        }

        // 10. Limpiar carrito
        cartService.clearCart(userId);

        // 11. Notificación
        notificationProducer.sendNotification(NotificationEvent.builder()
            .userId(userId)
            .type("ORDER_CREATED")
            .channel("EMAIL")
            .payload(Map.of("orderNumber", order.getOrderNumber(), "total", total))
            .build());

        auditLogService.log(userId, "ORDER_CREATED", "orders", order.getId(), null,
            Map.of("orderNumber", order.getOrderNumber()));

        return orderMapper.toResponse(order);
    }

    public void updateStatus(Long orderId, Long adminId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado"));

        String previousStatus = order.getStatus();
        order.setStatus(request.getStatus());
        orderRepository.save(order);

        addStatusHistory(order, adminId, request.getStatus(), request.getNote());

        // Liberar stock si se cancela
        if ("CANCELLED".equals(request.getStatus())) {
            order.getItems().forEach(item ->
                inventoryService.releaseReservation(
                    item.getProduct().getId(), item.getQuantity()));
        }

        // Confirmar venta si se paga
        if ("PAID".equals(request.getStatus())) {
            order.getItems().forEach(item ->
                inventoryService.confirmSale(
                    item.getProduct().getId(), item.getQuantity()));
        }

        notificationProducer.sendNotification(NotificationEvent.builder()
            .userId(order.getUserId())
            .type("ORDER_STATUS_CHANGED")
            .channel("EMAIL")
            .payload(Map.of(
                "orderNumber", order.getOrderNumber(),
                "newStatus", request.getStatus()))
            .build());

        auditLogService.log(adminId, "ORDER_STATUS_UPDATED", "orders", orderId,
            Map.of("status", previousStatus),
            Map.of("status", request.getStatus()));
    }

    private String generateOrderNumber() {
        return "ORD-" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE)
             + "-" + String.format("%05d", orderRepository.countToday() + 1);
    }

    private void addStatusHistory(Order order, Long changedBy, String status, String note) {
        orderStatusHistoryRepository.save(OrderStatusHistory.builder()
            .order(order)
            .changedBy(changedBy)
            .status(status)
            .note(note)
            .build());
    }

    private BigDecimal calculateSubtotal(List<CartItem> items) {
        return items.stream()
            .map(item -> {
                BigDecimal price = priceRepository.findActivePrice(item.getProduct().getId())
                    .orElseThrow(() -> new BusinessException("Sin precio activo"))
                    .getPrice();
                return price.multiply(BigDecimal.valueOf(item.getQuantity()));
            })
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
```

---

## 8. Módulo 5 — Pagos con Culqi

### CulqiService.java

```java
@Service
@RequiredArgsConstructor
public class CulqiService {

    @Value("${app.culqi.secret-key}")
    private String secretKey;

    @Value("${app.culqi.base-url}")
    private String baseUrl;

    private final WebClient.Builder webClientBuilder;

    public CulqiChargeResponse createCharge(CulqiChargeRequest request) {
        return webClientBuilder.build()
            .post()
            .uri(baseUrl + "/charges")
            .header("Authorization", "Bearer " + secretKey)
            .header("Content-Type", "application/json")
            .bodyValue(request)
            .retrieve()
            .onStatus(HttpStatusCode::isError, response ->
                response.bodyToMono(String.class)
                    .map(body -> new BusinessException("Error Culqi: " + body))
            )
            .bodyToMono(CulqiChargeResponse.class)
            .block();
    }
}
```

### PaymentService.java

```java
@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final CulqiService culqiService;
    private final OrderService orderService;
    private final NotificationProducer notificationProducer;
    private final AuditLogService auditLogService;

    public PaymentResponse processPayment(Long userId, CreatePaymentRequest request) {

        Order order = orderRepository.findById(request.getOrderId())
            .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado"));

        if (!order.getUserId().equals(userId)) {
            throw new UnauthorizedException("No autorizado para pagar este pedido");
        }

        if (!"PENDING".equals(order.getStatus())) {
            throw new BusinessException("El pedido no está en estado pendiente");
        }

        // Crear cobro en Culqi
        CulqiChargeRequest culqiRequest = CulqiChargeRequest.builder()
            .amount(order.getTotal().multiply(BigDecimal.valueOf(100)).intValue()) // centavos
            .currencyCode("PEN")
            .email(userRepository.findById(userId).map(User::getEmail).orElse(""))
            .sourceId(request.getCulqiToken())
            .build();

        Payment payment = Payment.builder()
            .order(order)
            .provider("CULQI")
            .amount(order.getTotal())
            .currency("PEN")
            .status("PENDING")
            .build();

        try {
            CulqiChargeResponse culqiResponse = culqiService.createCharge(culqiRequest);

            payment.setTransactionId(culqiResponse.getId());
            payment.setStatus("PAID");
            payment.setPaidAt(OffsetDateTime.now());
            payment.setMetadata(objectMapper.valueToTree(culqiResponse));

            paymentRepository.save(payment);

            // Actualizar estado del pedido
            orderService.updateStatus(order.getId(), null,
                new UpdateOrderStatusRequest("PAID", "Pago confirmado por Culqi"));

            notificationProducer.sendNotification(NotificationEvent.builder()
                .userId(userId)
                .type("PAYMENT_CONFIRMED")
                .channel("EMAIL")
                .payload(Map.of(
                    "orderNumber", order.getOrderNumber(),
                    "amount", order.getTotal()))
                .build());

            auditLogService.log(userId, "PAYMENT_CONFIRMED", "payments", payment.getId(),
                null, Map.of("transactionId", payment.getTransactionId()));

        } catch (BusinessException ex) {
            payment.setStatus("FAILED");
            paymentRepository.save(payment);
            auditLogService.log(userId, "PAYMENT_FAILED", "payments", order.getId(),
                null, Map.of("error", ex.getMessage()));
            throw ex;
        }

        return paymentMapper.toResponse(payment);
    }
}
```

---

## 9. Módulo 6 — Envíos y Tracking

### ShippingService.java

```java
@Service
@RequiredArgsConstructor
public class ShippingService {

    private final ShippingZoneRepository zoneRepository;
    private final ShippingRateRepository rateRepository;
    private final ShipmentRepository shipmentRepository;
    private final ShipmentTrackingRepository trackingRepository;

    public BigDecimal calculateCost(Long addressId, List<CartItem> items) {
        Address address = addressRepository.findById(addressId)
            .orElseThrow(() -> new ResourceNotFoundException("Dirección no encontrada"));

        ShippingZone zone = zoneRepository.findByDistrict(address.getDistrict())
            .orElseThrow(() -> new BusinessException("Zona de envío no disponible para el distrito"));

        BigDecimal totalWeight = items.stream()
            .map(item -> item.getProduct().getWeight()
                .multiply(BigDecimal.valueOf(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return rateRepository
            .findByZoneIdAndWeightRange(zone.getId(), totalWeight)
            .map(ShippingRate::getPrice)
            .orElseThrow(() -> new BusinessException("Sin tarifa disponible para el peso total"));
    }

    @Transactional
    public void addTrackingEvent(Long shipmentId, UpdateTrackingRequest request) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Envío no encontrado"));

        shipment.setStatus(request.getStatus());
        if (request.getTrackingCode() != null) {
            shipment.setTrackingCode(request.getTrackingCode());
        }
        shipmentRepository.save(shipment);

        trackingRepository.save(ShipmentTracking.builder()
            .shipment(shipment)
            .status(request.getStatus())
            .location(request.getLocation())
            .description(request.getDescription())
            .build());
    }

    public List<ShipmentTrackingResponse> getTracking(String orderNumber) {
        Shipment shipment = shipmentRepository.findByOrderNumber(orderNumber)
            .orElseThrow(() -> new ResourceNotFoundException("Envío no encontrado"));

        return trackingRepository.findByShipmentIdOrderByCreatedAtAsc(shipment.getId())
            .stream()
            .map(trackingMapper::toResponse)
            .collect(Collectors.toList());
    }
}
```

---

## 10. Módulo 7 — Cupones y Promociones

### CouponService.java

```java
@Service
@RequiredArgsConstructor
@Transactional
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponRedemptionRepository redemptionRepository;

    public BigDecimal validateAndCalculate(String code, Long userId, BigDecimal orderAmount) {
        Coupon coupon = couponRepository.findByCodeAndActiveTrue(code)
            .orElseThrow(() -> new BusinessException("Cupón inválido o inactivo"));

        LocalDate today = LocalDate.now();
        if (today.isBefore(coupon.getStartDate())) {
            throw new BusinessException("El cupón aún no está vigente");
        }
        if (coupon.getEndDate() != null && today.isAfter(coupon.getEndDate())) {
            throw new BusinessException("El cupón ha expirado");
        }
        if (coupon.getMaxUses() != null && coupon.getUsedCount() >= coupon.getMaxUses()) {
            throw new BusinessException("El cupón ha alcanzado el límite de usos");
        }
        if (orderAmount.compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new BusinessException(
                "El pedido mínimo para este cupón es S/ " + coupon.getMinOrderAmount());
        }
        if (redemptionRepository.existsByCouponIdAndUserId(coupon.getId(), userId)) {
            throw new BusinessException("Ya usaste este cupón anteriormente");
        }

        return "PERCENTAGE".equals(coupon.getDiscountType())
            ? orderAmount.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100))
            : coupon.getDiscountValue();
    }

    public void redeem(String code, Long userId, Long orderId) {
        Coupon coupon = couponRepository.findByCodeAndActiveTrue(code).orElseThrow();

        redemptionRepository.save(CouponRedemption.builder()
            .coupon(coupon)
            .userId(userId)
            .orderId(orderId)
            .build());

        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);
    }
}
```

---

## 11. Módulo 8 — Wishlist

### WishlistService.java

```java
@Service
@RequiredArgsConstructor
@Transactional
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final WishlistItemRepository wishlistItemRepository;
    private final ProductRepository productRepository;

    public WishlistResponse getWishlist(Long userId) {
        Wishlist wishlist = wishlistRepository.findByUserId(userId)
            .orElseGet(() -> wishlistRepository.save(
                Wishlist.builder().userId(userId).build()));
        return wishlistMapper.toResponse(wishlist);
    }

    public void addProduct(Long userId, Long productId) {
        productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

        Wishlist wishlist = wishlistRepository.findByUserId(userId)
            .orElseGet(() -> wishlistRepository.save(
                Wishlist.builder().userId(userId).build()));

        if (!wishlistItemRepository.existsByWishlistIdAndProductId(wishlist.getId(), productId)) {
            wishlistItemRepository.save(WishlistItem.builder()
                .wishlist(wishlist)
                .productId(productId)
                .build());
        }
    }

    public void removeProduct(Long userId, Long productId) {
        wishlistRepository.findByUserId(userId).ifPresent(w ->
            wishlistItemRepository.deleteByWishlistIdAndProductId(w.getId(), productId));
    }
}
```

---

## 12. Módulo 9 — Notificaciones con RabbitMQ

### NotificationEvent.java

```java
@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class NotificationEvent {
    private Long userId;
    private String type;        // ORDER_CREATED, PAYMENT_CONFIRMED, ORDER_SHIPPED...
    private String channel;     // EMAIL, SMS, PUSH
    private Map<String, Object> payload;
}
```

### NotificationProducer.java

```java
@Component
@RequiredArgsConstructor
public class NotificationProducer {

    private final RabbitTemplate rabbitTemplate;

    public void sendNotification(NotificationEvent event) {
        rabbitTemplate.convertAndSend(
            RabbitMQConfig.NOTIFICATION_EXCHANGE,
            RabbitMQConfig.NOTIFICATION_ROUTING,
            event
        );
    }
}
```

### NotificationConsumer.java

```java
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer {

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final UserRepository userRepository;

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_QUEUE)
    public void consume(NotificationEvent event) {
        Notification notification = Notification.builder()
            .userId(event.getUserId())
            .type(event.getType())
            .payload(objectMapper.valueToTree(event.getPayload()))
            .status("PENDING")
            .channel(event.getChannel())
            .build();

        notificationRepository.save(notification);

        try {
            if ("EMAIL".equals(event.getChannel())) {
                User user = userRepository.findById(event.getUserId()).orElseThrow();
                emailService.send(user.getEmail(), event.getType(), event.getPayload());
            }

            notification.setStatus("SENT");
            notification.setSentAt(OffsetDateTime.now());

        } catch (Exception ex) {
            log.error("Error enviando notificación tipo {}: {}", event.getType(), ex.getMessage());
            notification.setStatus("FAILED");
        }

        notificationRepository.save(notification);
    }
}
```

### EmailService.java

```java
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;

    private static final Map<String, String> TEMPLATE_MAP = Map.of(
        "ORDER_CREATED",      "email-order-created",
        "PAYMENT_CONFIRMED",  "email-payment-confirmed",
        "ORDER_SHIPPED",      "email-order-shipped",
        "WELCOME",            "email-welcome",
        "PASSWORD_RESET",     "email-password-reset"
    );

    public void send(String to, String type, Map<String, Object> payload) {
        String templateName = TEMPLATE_MAP.get(type);
        if (templateName == null) return;

        Context ctx = new Context();
        ctx.setVariables(payload);

        String html = templateEngine.process(templateName, ctx);

        MimeMessage message = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(getSubject(type));
            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException ex) {
            throw new RuntimeException("Error al enviar email: " + ex.getMessage(), ex);
        }
    }

    private String getSubject(String type) {
        return switch (type) {
            case "ORDER_CREATED"     -> "Tu pedido fue recibido";
            case "PAYMENT_CONFIRMED" -> "Pago confirmado";
            case "ORDER_SHIPPED"     -> "Tu pedido está en camino";
            case "WELCOME"           -> "Bienvenido a nuestra tienda";
            case "PASSWORD_RESET"    -> "Recupera tu contraseña";
            default                  -> "Notificación";
        };
    }
}
```

---

## 13. Módulo 10 — Auditoría

### AuditLogService.java

```java
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;
    private final HttpServletRequest httpRequest;

    @Async
    public void log(Long userId, String action, String entity,
                    Long entityId, Object oldValue, Object newValue) {
        try {
            AuditLog log = AuditLog.builder()
                .userId(userId)
                .action(action)
                .entity(entity)
                .entityId(entityId)
                .oldValue(oldValue != null
                    ? objectMapper.valueToTree(oldValue) : null)
                .newValue(newValue != null
                    ? objectMapper.valueToTree(newValue) : null)
                .ipAddress(getClientIp())
                .build();

            auditLogRepository.save(log);
        } catch (Exception ex) {
            // El log de auditoría nunca debe romper el flujo principal
        }
    }

    private String getClientIp() {
        String forwarded = httpRequest.getHeader("X-Forwarded-For");
        return (forwarded != null && !forwarded.isEmpty())
            ? forwarded.split(",")[0].trim()
            : httpRequest.getRemoteAddr();
    }
}
```

---

## 14. Manejo Global de Errores

### ApiResponse.java

```java
@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private List<String> errors;
    private LocalDateTime timestamp = LocalDateTime.now();

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
            .success(true).data(data).build();
    }

    public static <T> ApiResponse<T> error(String message, List<String> errors) {
        return ApiResponse.<T>builder()
            .success(false).message(message).errors(errors).build();
    }
}
```

### GlobalExceptionHandler.java

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(NOT_FOUND)
            .body(ApiResponse.error(ex.getMessage(), null));
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusiness(BusinessException ex) {
        return ResponseEntity.status(UNPROCESSABLE_ENTITY)
            .body(ApiResponse.error(ex.getMessage(), null));
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse<Void>> handleUnauthorized(UnauthorizedException ex) {
        return ResponseEntity.status(UNAUTHORIZED)
            .body(ApiResponse.error(ex.getMessage(), null));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .collect(Collectors.toList());
        return ResponseEntity.status(BAD_REQUEST)
            .body(ApiResponse.error("Error de validación", errors));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(FORBIDDEN)
            .body(ApiResponse.error("Acceso denegado", null));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneric(Exception ex) {
        log.error("Error no controlado: ", ex);
        return ResponseEntity.status(INTERNAL_SERVER_ERROR)
            .body(ApiResponse.error("Error interno del servidor", null));
    }
}
```

---

## 15. Resumen de Endpoints

### Autenticación — público

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/auth/register` | Registro de nuevo cliente |
| `POST` | `/auth/login` | Inicio de sesión |
| `POST` | `/auth/refresh` | Renovar access token |
| `POST` | `/auth/logout` | Cerrar sesión |
| `POST` | `/auth/password-reset/request` | Solicitar recuperación de contraseña |
| `POST` | `/auth/password-reset/confirm` | Confirmar nueva contraseña |

### Usuario — autenticado

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/users/me` | Perfil del usuario |
| `PUT` | `/users/me` | Actualizar perfil |
| `GET` | `/users/me/addresses` | Listar direcciones |
| `POST` | `/users/me/addresses` | Agregar dirección |
| `PUT` | `/users/me/addresses/{id}` | Actualizar dirección |
| `DELETE` | `/users/me/addresses/{id}` | Eliminar dirección |
| `PATCH` | `/users/me/addresses/{id}/default` | Marcar como predeterminada |

### Catálogo — público

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/catalog/products` | Listar productos con filtros y paginación |
| `GET` | `/catalog/products/{slug}` | Detalle de producto |
| `GET` | `/catalog/categories` | Árbol de categorías |
| `GET` | `/catalog/categories/{slug}/products` | Productos por categoría |

### Carrito — autenticado

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/cart` | Ver carrito actual |
| `POST` | `/cart/items` | Agregar producto |
| `PATCH` | `/cart/items/{productId}` | Cambiar cantidad |
| `DELETE` | `/cart/items/{productId}` | Eliminar producto |
| `DELETE` | `/cart` | Vaciar carrito |

### Pedidos — autenticado

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/orders` | Crear pedido desde carrito |
| `GET` | `/orders` | Historial de pedidos del usuario |
| `GET` | `/orders/{orderNumber}` | Detalle de pedido |
| `GET` | `/orders/{orderNumber}/tracking` | Estado del envío |

### Pagos — autenticado

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/payments` | Procesar pago con Culqi |
| `GET` | `/payments/{orderId}` | Detalle del pago |

### Envíos — público y autenticado

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/shipping/rates/calculate` | Calcular costo de envío |
| `GET` | `/shipping/zones` | Listar zonas disponibles |

### Wishlist — autenticado

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/wishlist` | Ver wishlist |
| `POST` | `/wishlist/items/{productId}` | Agregar producto |
| `DELETE` | `/wishlist/items/{productId}` | Eliminar producto |

### Cupones — autenticado

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/coupons/validate` | Validar cupón y obtener descuento |

### Administración — ADMIN

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/admin/products` | Listar todos los productos |
| `POST` | `/admin/products` | Crear producto |
| `PUT` | `/admin/products/{id}` | Actualizar producto |
| `DELETE` | `/admin/products/{id}` | Eliminar producto (soft delete) |
| `PATCH` | `/admin/products/{id}/inventory` | Actualizar stock |
| `POST` | `/admin/products/{id}/prices` | Agregar nuevo precio |
| `GET` | `/admin/categories` | Listar categorías |
| `POST` | `/admin/categories` | Crear categoría |
| `PUT` | `/admin/categories/{id}` | Actualizar categoría |
| `DELETE` | `/admin/categories/{id}` | Eliminar categoría |
| `GET` | `/admin/orders` | Listar todos los pedidos |
| `PATCH` | `/admin/orders/{id}/status` | Cambiar estado del pedido |
| `POST` | `/admin/shipments/{orderId}` | Crear envío para pedido |
| `PATCH` | `/admin/shipments/{id}/tracking` | Agregar evento de tracking |
| `GET` | `/admin/users` | Listar usuarios |
| `PATCH` | `/admin/users/{id}/active` | Activar/desactivar usuario |
| `GET` | `/admin/coupons` | Listar cupones |
| `POST` | `/admin/coupons` | Crear cupón |
| `PATCH` | `/admin/coupons/{id}` | Actualizar cupón |
| `GET` | `/admin/audit-logs` | Consultar auditoría |

---

## 16. Orden de Implementación

Seguir este orden garantiza que cada módulo tenga sus dependencias resueltas antes de construirse.

```
FASE 1 — Fundación
──────────────────
 1. Configuración del proyecto (pom.xml, application.yml, estructura de paquetes)
 2. Shared: ApiResponse, excepciones, PageResponse
 3. Módulo Seguridad: User, Role, JWT, SecurityConfig, AuthController
 4. Módulo Usuario: Address, UserController

FASE 2 — Catálogo
──────────────────
 5. Category + CategoryController (público y admin)
 6. Product + ProductImages + ProductPrices + ProductController
 7. Inventory + InventoryService (con bloqueo pesimista)

FASE 3 — Compras
──────────────────
 8. Cart + CartService + CartController
 9. Coupon + CouponService (validación antes de crear orden)
10. Order + OrderService + OrderController
11. Payment + CulqiService + PaymentService + PaymentController

FASE 4 — Logística
──────────────────
12. ShippingZone + ShippingRate + ShippingService
13. Shipment + ShipmentTracking + ShippingController

FASE 5 — Extras
──────────────────
14. Wishlist + WishlistController
15. RabbitMQ: NotificationProducer + NotificationConsumer
16. EmailService + templates Thymeleaf
17. AuditLogService (agregar llamadas en todos los servicios)

FASE 6 — Calidad
──────────────────
18. Tests unitarios (Services con Mockito)
19. Tests de integración (Controllers con MockMvc)
20. Revisión de seguridad: validaciones, autorización por endpoint
```

---

## Variables de Entorno Requeridas en Producción

```bash
# Base de datos
DB_URL=jdbc:postgresql://host:5432/ecommerce_db
DB_USER=ecommerce_user
DB_PASSWORD=*****

# JWT (generar con: openssl rand -base64 64)
JWT_SECRET=*****

# Culqi
CULQI_SECRET_KEY=sk_live_*****
CULQI_PUBLIC_KEY=pk_live_*****

# Shalom (cuando esté disponible)
SHALOM_API_URL=https://api.shalom.com.pe
SHALOM_API_KEY=*****

# RabbitMQ
RABBITMQ_HOST=localhost
RABBITMQ_USER=ecommerce
RABBITMQ_PASSWORD=*****

# Email
MAIL_HOST=smtp.gmail.com
MAIL_USER=noreply@tutienda.pe
MAIL_PASSWORD=*****

# CORS
CORS_ORIGINS=https://tutienda.pe
```

---

*backendEcommerce.md — v1.0*
