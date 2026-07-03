package com.ecommerce.shipping.repository;

import com.ecommerce.shipping.entity.ShippingRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.Optional;

public interface ShippingRateRepository extends JpaRepository<ShippingRate, Integer> {
    @Query("SELECT r FROM ShippingRate r WHERE r.zoneId = :zoneId AND :weight >= r.weightMin AND :weight < r.weightMax")
    Optional<ShippingRate> findByZoneIdAndWeightRange(@Param("zoneId") Integer zoneId, @Param("weight") BigDecimal weight);
}