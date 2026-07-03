package com.ecommerce.cart.service;

import com.ecommerce.cart.dto.*;
import com.ecommerce.cart.entity.*;
import com.ecommerce.cart.repository.*;
import com.ecommerce.catalog.entity.*;
import com.ecommerce.catalog.repository.*;
import com.ecommerce.shared.exception.BusinessException;
import com.ecommerce.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final ProductPriceRepository priceRepository;

    public CartResponse getOrCreateCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
            .orElseGet(() -> cartRepository.save(
                Cart.builder().userId(userId).build()
            ));
        return toResponse(cart);
    }

    public CartResponse addItem(Long userId, CartItemRequest request) {
        Cart cart = cartRepository.findByUserId(userId)
            .orElseGet(() -> cartRepository.save(
                Cart.builder().userId(userId).build()
            ));

        Product product = productRepository.findById(request.getProductId())
            .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

        Inventory inventory = inventoryRepository.findByProductIdForUpdate(product.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Sin inventario"));

        if (inventory.getAvailableStock() < request.getQuantity()) {
            throw new BusinessException("Stock insuficiente");
        }

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId())
            .map(existing -> {
                existing.setQuantity(existing.getQuantity() + request.getQuantity());
                return existing;
            })
            .orElse(CartItem.builder()
                .cart(cart)
                .product(product)
                .quantity(request.getQuantity())
                .build());

        cartItemRepository.save(item);
        return toResponse(cart);
    }

    public CartResponse updateItem(Long userId, Long productId, int quantity) {
        Cart cart = cartRepository.findByUserIdOrThrow(userId);

        if (quantity <= 0) {
            cartItemRepository.deleteByCartIdAndProductId(cart.getId(), productId);
        } else {
            CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Item no encontrado en carrito"));
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        return toResponse(cart);
    }

    public void clearCart(Long userId) {
        cartRepository.findByUserId(userId)
            .ifPresent(c -> cartItemRepository.deleteAllByCartId(c.getId()));
    }

    private CartResponse toResponse(Cart cart) {
        List<CartItemResponse> itemResponses = cart.getItems().stream()
            .map(item -> {
                BigDecimal unitPrice = priceRepository.findActivePrice(item.getProduct().getId())
                    .map(ProductPrice::getPrice)
                    .orElse(BigDecimal.ZERO);
                BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
                return CartItemResponse.builder()
                    .productId(item.getProduct().getId())
                    .productName(item.getProduct().getName())
                    .quantity(item.getQuantity())
                    .unitPrice(unitPrice)
                    .subtotal(subtotal)
                    .build();
            })
            .collect(Collectors.toList());

        BigDecimal total = itemResponses.stream()
            .map(CartItemResponse::getSubtotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
            .id(cart.getId())
            .items(itemResponses)
            .total(total)
            .build();
    }
}