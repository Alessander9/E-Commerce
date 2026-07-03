package com.ecommerce.catalog.repository;

import com.ecommerce.catalog.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySlug(String slug);
    boolean existsBySku(String sku);

    @Query("""
        SELECT p FROM Product p
        JOIN p.categories c
        WHERE (:categoryId IS NULL OR c.id = :categoryId)
          AND (CAST(:search AS string) IS NULL OR LOWER(p.name) LIKE :search)
          AND p.active = true
        ORDER BY p.createdAt DESC
        """)
    Page<Product> findWithFilters(
        @Param("categoryId") Integer categoryId,
        @Param("search") String search,
        Pageable pageable
    );

    @Query("""
        SELECT DISTINCT p FROM Product p
        LEFT JOIN FETCH p.images
        LEFT JOIN FETCH p.prices pp
        WHERE p.id = :id AND pp.isActive = true
        """)
    Optional<Product> findByIdWithDetails(@Param("id") Long id);
}