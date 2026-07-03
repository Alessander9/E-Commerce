package com.ecommerce.catalog.controller;

import com.ecommerce.catalog.dto.ProductResponse;
import com.ecommerce.catalog.dto.ProductSummaryResponse;
import com.ecommerce.catalog.service.ProductService;
import com.ecommerce.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/catalog/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductSummaryResponse>>> list(
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(ApiResponse.success(
            productService.listProducts(categoryId, search, PageRequest.of(page, size))
        ));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<ProductResponse>> getDetails(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductDetails(slug)));
    }
}