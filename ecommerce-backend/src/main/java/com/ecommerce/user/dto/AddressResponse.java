package com.ecommerce.user.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressResponse {
    private Long id;
    private String department;
    private String province;
    private String district;
    private String addressLine;
    private String reference;
    private boolean isDefault;
}