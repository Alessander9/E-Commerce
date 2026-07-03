package com.ecommerce.security.service;

import com.ecommerce.audit.service.AuditLogService;
import com.ecommerce.notification.service.EmailService;
import com.ecommerce.notification.service.NotificationService;
import com.ecommerce.notification.dto.NotificationEvent;
import com.ecommerce.notification.messaging.NotificationProducer;
import com.ecommerce.security.dto.*;
import com.ecommerce.security.entity.*;
import com.ecommerce.security.repository.*;
import com.ecommerce.shared.exception.BusinessException;
import com.ecommerce.shared.exception.ResourceNotFoundException;
import com.ecommerce.shared.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final NotificationProducer notificationProducer;
    private final AuditLogService auditLogService;
    private final EmailService emailService;
    private final NotificationService notificationService;

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

        notificationService.sendWelcome(user.getId(), user.getFirstName());

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

        User user = stored.getUser();
        String accessToken  = jwtService.generateAccessToken(user);
        String refreshToken = refreshTokenService.create(user);
        return new AuthResponse(accessToken, refreshToken);
    }

    public void logout(String refreshToken) {
        refreshTokenRepository.findByToken(refreshToken).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    }

    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email.toLowerCase())
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        passwordResetTokenRepository.findAll().stream()
            .filter(token -> token.getUser().getId().equals(user.getId()) && !token.isUsed())
            .forEach(token -> {
                token.setUsed(true);
                passwordResetTokenRepository.save(token);
            });

        String token = UUID.randomUUID().toString().replace("-", "");
        PasswordResetToken resetToken = PasswordResetToken.builder()
            .user(user)
            .token(token)
            .expiresAt(OffsetDateTime.now().plusHours(2))
            .used(false)
            .build();
        passwordResetTokenRepository.save(resetToken);

        notificationService.sendPasswordReset(
            user.getId(),
            user.getFirstName(),
            token,
            resetToken.getExpiresAt().toString()
        );
    }

    public void confirmPasswordReset(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
            .orElseThrow(() -> new UnauthorizedException("Token de recuperación inválido"));

        if (resetToken.isUsed() || resetToken.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new UnauthorizedException("Token de recuperación expirado o usado");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }
}
