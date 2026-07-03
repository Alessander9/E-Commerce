package com.ecommerce.catalog.service;

import com.ecommerce.catalog.dto.*;
import com.ecommerce.catalog.entity.*;
import com.ecommerce.catalog.repository.*;
import com.ecommerce.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryRepository inventoryRepository;
    private final ProductPriceRepository priceRepository;

    public Page<ProductSummaryResponse> listProducts(Integer categoryId, String search, Pageable pageable) {
        String searchParam = (search != null && !search.trim().isEmpty()) ? "%" + search.trim().toLowerCase() + "%" : null;
        return productRepository.findWithFilters(categoryId, searchParam, pageable)
            .map(this::toSummaryResponse);
    }

    public ProductResponse getProductDetails(String slug) {
        Product product = productRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
        return toResponse(product);
    }

    public ProductResponse create(ProductRequest request) {
        List<Category> categories = categoryRepository.findAllById(request.getCategoryIds());
        Product product = Product.builder()
            .name(request.getName())
            .slug(request.getSlug())
            .description(request.getDescription())
            .sku(request.getSku())
            .weight(request.getWeight())
            .height(request.getHeight())
            .width(request.getWidth())
            .length(request.getLength())
            .metaTitle(request.getMetaTitle())
            .metaDescription(request.getMetaDescription())
            .categories(new HashSet<>(categories))
            .build();

        productRepository.save(product);

        Inventory inventory = Inventory.builder()
            .product(product)
            .availableStock(0)
            .reservedStock(0)
            .build();
        inventoryRepository.save(inventory);

        return toResponse(product);
    }

    public ProductResponse update(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
        List<Category> categories = categoryRepository.findAllById(request.getCategoryIds());
        product.setName(request.getName());
        product.setSlug(request.getSlug());
        product.setDescription(request.getDescription());
        product.setSku(request.getSku());
        product.setWeight(request.getWeight());
        product.setHeight(request.getHeight());
        product.setWidth(request.getWidth());
        product.setLength(request.getLength());
        product.setMetaTitle(request.getMetaTitle());
        product.setMetaDescription(request.getMetaDescription());
        product.setCategories(new HashSet<>(categories));
        productRepository.save(product);
        return toResponse(product);
    }

    public void softDelete(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
        product.setDeletedAt(OffsetDateTime.now());
        productRepository.save(product);
    }

    public void updateInventory(Long id, InventoryUpdateRequest request) {
        Inventory inventory = inventoryRepository.findByProductIdForUpdate(id)
            .orElseThrow(() -> new ResourceNotFoundException("Inventario no encontrado"));
        inventory.setAvailableStock(request.getAvailableStock());
        inventoryRepository.save(inventory);
    }

    public void addPrice(Long id, ProductPriceRequest request) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

        // Deactivate old active price
        priceRepository.findActivePrice(id).ifPresent(oldPrice -> {
            oldPrice.setActive(false);
            priceRepository.save(oldPrice);
        });

        ProductPrice price = ProductPrice.builder()
            .product(product)
            .price(request.getPrice())
            .startDate(request.getStartDate())
            .endDate(request.getEndDate())
            .isActive(true)
            .build();
        priceRepository.save(price);
    }

    private ProductSummaryResponse toSummaryResponse(Product product) {
        String mainImg = product.getImages().stream()
            .filter(ProductImage::isPrimary)
            .map(ProductImage::getUrl)
            .findFirst()
            .orElse(product.getImages().isEmpty() ? null : product.getImages().get(0).getUrl());

        java.math.BigDecimal activePrice = priceRepository.findActivePrice(product.getId())
            .map(ProductPrice::getPrice)
            .orElse(java.math.BigDecimal.ZERO);

        return ProductSummaryResponse.builder()
            .id(product.getId())
            .name(product.getName())
            .slug(product.getSlug())
            .sku(product.getSku())
            .price(activePrice)
            .primaryImageUrl(mainImg)
            .build();
    }

    private ProductResponse toResponse(Product product) {
        java.math.BigDecimal activePrice = priceRepository.findActivePrice(product.getId())
            .map(ProductPrice::getPrice)
            .orElse(java.math.BigDecimal.ZERO);

        int stock = product.getInventory() != null ? product.getInventory().getAvailableStock() : 0;

        return ProductResponse.builder()
            .id(product.getId())
            .name(product.getName())
            .slug(product.getSlug())
            .description(product.getDescription())
            .sku(product.getSku())
            .weight(product.getWeight())
            .height(product.getHeight())
            .width(product.getWidth())
            .length(product.getLength())
            .active(product.isActive())
            .price(activePrice)
            .availableStock(stock)
            .imageUrls(product.getImages().stream().map(ProductImage::getUrl).collect(Collectors.toList()))
            .build();
    }
}