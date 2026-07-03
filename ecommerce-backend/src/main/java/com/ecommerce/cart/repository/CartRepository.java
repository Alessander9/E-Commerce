package com.ecommerce.cart.repository;

import com.ecommerce.cart.entity.Cart;
import com.ecommerce.shared.exception.ResourceNotFoundException;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUserId(Long userId);
    default Cart findByUserIdOrThrow(Long userId) {
        return findByUserId(userId).orElseThrow(() -> new ResourceNotFoundException("Carrito no encontrado"));
    }
}