package com.ecommerce.security.service;

import com.ecommerce.security.entity.RefreshToken;
import com.ecommerce.security.entity.User;
import com.ecommerce.security.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    public String create(User user) {
        RefreshToken token = RefreshToken.builder()
            .user(user)
            .token(UUID.randomUUID().toString())
            .expiresAt(OffsetDateTime.now().plusWeeks(1))
            .revoked(false)
            .build();
        refreshTokenRepository.save(token);
        return token.getToken();
    }
}