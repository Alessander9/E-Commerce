package com.ecommerce.catalog.controller;

import com.ecommerce.catalog.dto.CategoryResponse;
import com.ecommerce.catalog.dto.ProductSummaryResponse;
import com.ecommerce.catalog.service.CategoryService;
import com.ecommerce.catalog.service.ProductService;
import com.ecommerce.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/catalog/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getRootCategories()));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getBySlug(slug)));
    }

    @GetMapping("/{slug}/products")
    public ResponseEntity<ApiResponse<Page<ProductSummaryResponse>>> getProductsByCategory(
            @PathVariable String slug,
            Pageable pageable) {
        Integer categoryId = categoryService.getCategoryIdBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(
            productService.listProducts(categoryId, null, pageable)
        ));
    }
}
