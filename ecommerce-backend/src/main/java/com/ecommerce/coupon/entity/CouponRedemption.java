package com.ecommerce.coupon.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "coupon_redemptions")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class CouponRedemption {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_id", nullable = false)
    private Coupon coupon;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "redeemed_at", nullable = false)
    @Builder.Default
    private OffsetDateTime redeemedAt = OffsetDateTime.now();
}