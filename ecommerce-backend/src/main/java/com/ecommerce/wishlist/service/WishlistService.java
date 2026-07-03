package com.ecommerce.wishlist.service;

import com.ecommerce.catalog.repository.ProductRepository;
import com.ecommerce.shared.exception.ResourceNotFoundException;
import com.ecommerce.wishlist.dto.WishlistResponse;
import com.ecommerce.wishlist.entity.*;
import com.ecommerce.wishlist.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

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
        return WishlistResponse.builder()
            .id(wishlist.getId())
            .productIds(wishlist.getItems().stream().map(WishlistItem::getProductId).collect(Collectors.toList()))
            .build();
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