package com.ecommerce.security.controller;

import com.ecommerce.security.dto.*;
import com.ecommerce.security.service.AuthService;
import com.ecommerce.security.util.CookieUtil;
import com.ecommerce.shared.response.ApiResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final CookieUtil cookieUtil;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse response) {
        AuthResponse authRes = authService.register(request);
        cookieUtil.create(response, "access_token", authRes.getAccessToken(), 15 * 60);
        cookieUtil.create(response, "refresh_token", authRes.getRefreshToken(), 7 * 24 * 60 * 60);
        return ResponseEntity.ok(ApiResponse.success(new AuthResponse(null, null)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {
        AuthResponse authRes = authService.login(request);
        cookieUtil.create(response, "access_token", authRes.getAccessToken(), 15 * 60);
        cookieUtil.create(response, "refresh_token", authRes.getRefreshToken(), 7 * 24 * 60 * 60);
        return ResponseEntity.ok(ApiResponse.success(new AuthResponse(null, null)));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            HttpServletRequest request,
            HttpServletResponse response) {
        String refreshToken = null;
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("refresh_token".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                }
            }
        }
        if (refreshToken == null) {
            throw new com.ecommerce.shared.exception.UnauthorizedException("Refresh token cookie not found");
        }
        AuthResponse authRes = authService.refresh(new RefreshTokenRequest(refreshToken));
        cookieUtil.create(response, "access_token", authRes.getAccessToken(), 15 * 60);
        cookieUtil.create(response, "refresh_token", authRes.getRefreshToken(), 7 * 24 * 60 * 60);
        return ResponseEntity.ok(ApiResponse.success(new AuthResponse(null, null)));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            HttpServletRequest request,
            HttpServletResponse response) {
        String refreshToken = null;
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("refresh_token".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                }
            }
        }
        if (refreshToken != null) {
            authService.logout(refreshToken);
        }
        cookieUtil.clear(response, "access_token");
        cookieUtil.clear(response, "refresh_token");
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/password-reset/request")
    public ResponseEntity<ApiResponse<Void>> requestPasswordReset(
            @Valid @RequestBody PasswordResetRequest request) {
        authService.requestPasswordReset(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/password-reset/confirm")
    public ResponseEntity<ApiResponse<Void>> confirmPasswordReset(
            @Valid @RequestBody PasswordResetRequest request) {
        authService.confirmPasswordReset(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
