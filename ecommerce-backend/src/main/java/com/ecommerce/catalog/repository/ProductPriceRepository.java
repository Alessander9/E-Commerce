package com.ecommerce.catalog.repository;

import com.ecommerce.catalog.entity.ProductPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface ProductPriceRepository extends JpaRepository<ProductPrice, Long> {
    @Query("SELECT p FROM ProductPrice p WHERE p.product.id = :productId AND p.isActive = true")
    Optional<ProductPrice> findActivePrice(@Param("productId") Long productId);
}