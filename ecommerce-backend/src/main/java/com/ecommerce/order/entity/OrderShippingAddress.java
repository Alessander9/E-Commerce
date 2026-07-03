package com.ecommerce.order.entity;

import com.ecommerce.user.entity.Address;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "order_shipping_address")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class OrderShippingAddress {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private String province;

    @Column(nullable = false)
    private String district;

    @Column(name = "address_line", nullable = false, columnDefinition = "TEXT")
    private String addressLine;

    @Column(columnDefinition = "TEXT")
    private String reference;

    public static OrderShippingAddress from(Order order, Address address) {
        return OrderShippingAddress.builder()
            .order(order)
            .department(address.getDepartment())
            .province(address.getProvince())
            .district(address.getDistrict())
            .addressLine(address.getAddressLine())
            .reference(address.getReference())
            .build();
    }
}