package com.ecommerce.shipping.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "shipping_zones")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class ShippingZone {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private boolean active = true;
}