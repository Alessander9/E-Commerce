package com.ecommerce.shipping.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "shipping_rates")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class ShippingRate {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "zone_id", nullable = false)
    private Integer zoneId;

    @Column(name = "weight_min", nullable = false)
    private BigDecimal weightMin;

    @Column(name = "weight_max", nullable = false)
    private BigDecimal weightMax;

    @Column(nullable = false)
    private BigDecimal price;
}