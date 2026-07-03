package com.ecommerce.wishlist.controller;

import com.ecommerce.security.entity.User;
import com.ecommerce.shared.response.ApiResponse;
import com.ecommerce.wishlist.dto.WishlistResponse;
import com.ecommerce.wishlist.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<ApiResponse<WishlistResponse>> get(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(wishlistService.getWishlist(user.getId())));
    }

    @PostMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<Void>> add(
            @AuthenticationPrincipal User user,
            @PathVariable Long productId) {
        wishlistService.addProduct(user.getId(), productId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<Void>> remove(
            @AuthenticationPrincipal User user,
            @PathVariable Long productId) {
        wishlistService.removeProduct(user.getId(), productId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}