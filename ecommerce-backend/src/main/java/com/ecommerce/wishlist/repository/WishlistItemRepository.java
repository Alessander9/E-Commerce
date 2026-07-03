package com.ecommerce.wishlist.repository;

import com.ecommerce.wishlist.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {
    boolean existsByWishlistIdAndProductId(Long wishlistId, Long productId);

    @Modifying
    @Query("DELETE FROM WishlistItem wi WHERE wi.wishlist.id = :wishlistId AND wi.productId = :productId")
    void deleteByWishlistIdAndProductId(@Param("wishlistId") Long wishlistId, @Param("productId") Long productId);
}