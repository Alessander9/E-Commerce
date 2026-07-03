package com.ecommerce.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressRequest {
    @NotBlank
    private String department;
    @NotBlank
    private String province;
    @NotBlank
    private String district;
    @NotBlank
    private String addressLine;
    private String reference;
    private boolean isDefault;
}