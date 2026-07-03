package com.ecommerce.shipping.repository;

import com.ecommerce.shipping.entity.ShipmentTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ShipmentTrackingRepository extends JpaRepository<ShipmentTracking, Long> {
    List<ShipmentTracking> findByShipmentIdOrderByCreatedAtAsc(Long shipmentId);
}