package com.ecommerce.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryRequest {
    private Integer parentId;
    @NotBlank
    private String name;
    @NotBlank
    private String slug;
    private String description;
    private boolean active = true;
}