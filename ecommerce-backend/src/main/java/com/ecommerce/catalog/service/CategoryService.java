package com.ecommerce.catalog.service;

import com.ecommerce.catalog.dto.*;
import com.ecommerce.catalog.entity.Category;
import com.ecommerce.catalog.repository.CategoryRepository;
import com.ecommerce.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryResponse> getRootCategories() {
        return categoryRepository.findByParentIdIsNull().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public CategoryResponse getBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));
        return toResponse(category);
    }

    public Integer getCategoryIdBySlug(String slug) {
        return categoryRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"))
            .getId();
    }

    public CategoryResponse create(CategoryRequest request) {
        Category parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría padre no encontrada"));
        }

        Category category = Category.builder()
            .parent(parent)
            .name(request.getName())
            .slug(request.getSlug())
            .description(request.getDescription())
            .active(request.isActive())
            .build();

        categoryRepository.save(category);
        return toResponse(category);
    }

    public CategoryResponse update(Integer id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));

        Category parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría padre no encontrada"));
        }

        category.setName(request.getName());
        category.setSlug(request.getSlug());
        category.setDescription(request.getDescription());
        category.setParent(parent);
        category.setActive(request.isActive());

        categoryRepository.save(category);
        return toResponse(category);
    }

    public void delete(Integer id) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));
        categoryRepository.delete(category);
    }

    private CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
            .id(category.getId())
            .parentId(category.getParent() != null ? category.getParent().getId() : null)
            .name(category.getName())
            .slug(category.getSlug())
            .description(category.getDescription())
            .active(category.isActive())
            .subcategories(category.getSubcategories().stream().map(this::toResponse).collect(Collectors.toList()))
            .build();
    }
}
