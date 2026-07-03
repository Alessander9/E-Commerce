package com.ecommerce.catalog.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    private Integer id;
    private Integer parentId;
    private String name;
    private String slug;
    private String description;
    private boolean active;
    private List<CategoryResponse> subcategories;
}