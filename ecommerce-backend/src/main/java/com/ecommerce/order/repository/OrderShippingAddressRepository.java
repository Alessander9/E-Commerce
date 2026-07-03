package com.ecommerce.order.repository;

import com.ecommerce.order.entity.OrderShippingAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OrderShippingAddressRepository extends JpaRepository<OrderShippingAddress, Long> {
    Optional<OrderShippingAddress> findByOrderId(Long orderId);
}