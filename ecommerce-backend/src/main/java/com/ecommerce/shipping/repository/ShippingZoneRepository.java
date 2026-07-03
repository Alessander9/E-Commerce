package com.ecommerce.shipping.repository;

import com.ecommerce.shipping.entity.ShippingZone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface ShippingZoneRepository extends JpaRepository<ShippingZone, Integer> {
    @Query("SELECT z FROM ShippingZone z WHERE LOWER(z.name) = LOWER(:name) AND z.active = true")
    Optional<ShippingZone> findByDistrict(@Param("name") String name);
}