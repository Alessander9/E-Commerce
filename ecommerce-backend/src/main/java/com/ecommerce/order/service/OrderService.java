package com.ecommerce.order.service;

import com.ecommerce.audit.service.AuditLogService;
import com.ecommerce.cart.entity.Cart;
import com.ecommerce.cart.entity.CartItem;
import com.ecommerce.cart.repository.CartRepository;
import com.ecommerce.cart.service.CartService;
import com.ecommerce.catalog.repository.ProductPriceRepository;
import com.ecommerce.catalog.entity.ProductPrice;
import com.ecommerce.catalog.service.InventoryService;
import com.ecommerce.coupon.service.CouponService;
import com.ecommerce.notification.dto.NotificationEvent;
import com.ecommerce.notification.messaging.NotificationProducer;
import com.ecommerce.order.dto.*;
import com.ecommerce.order.entity.*;
import com.ecommerce.order.repository.*;
import com.ecommerce.shared.exception.BusinessException;
import com.ecommerce.shared.exception.ResourceNotFoundException;
import com.ecommerce.shipping.service.ShippingService;
import com.ecommerce.user.entity.Address;
import com.ecommerce.user.repository.AddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final OrderShippingAddressRepository orderShippingAddressRepository;
    private final CartRepository cartRepository;
    private final CartService cartService;
    private final InventoryService inventoryService;
    private final ShippingService shippingService;
    private final CouponService couponService;
    private final NotificationProducer notificationProducer;
    private final AuditLogService auditLogService;
    private final AddressRepository addressRepository;
    private final ProductPriceRepository priceRepository;

    public OrderResponse createFromCart(Long userId, CreateOrderRequest request) {
        Cart cart = cartRepository.findByUserIdOrThrow(userId);
        if (cart.getItems().isEmpty()) {
            throw new BusinessException("El carrito está vacío");
        }

        BigDecimal subtotal = calculateSubtotal(cart.getItems());
        BigDecimal shippingCost = shippingService.calculateCost(request.getAddressId(), cart.getItems());

        BigDecimal discount = BigDecimal.ZERO;
        if (request.getCouponCode() != null) {
            discount = couponService.validateAndCalculate(request.getCouponCode(), userId, subtotal);
        }

        BigDecimal total = subtotal.add(shippingCost).subtract(discount);

        Order order = Order.builder()
            .orderNumber(generateOrderNumber())
            .userId(userId)
            .status("PENDING")
            .subtotal(subtotal)
            .shippingCost(shippingCost)
            .discountAmount(discount)
            .total(total)
            .build();

        orderRepository.save(order);

        Address address = addressRepository.findByIdAndUserId(request.getAddressId(), userId)
            .orElseThrow(() -> new ResourceNotFoundException("Dirección no encontrada"));

        orderShippingAddressRepository.save(OrderShippingAddress.from(order, address));

        for (CartItem item : cart.getItems()) {
            BigDecimal unitPrice = priceRepository.findActivePrice(item.getProduct().getId())
                .orElseThrow(() -> new BusinessException("Sin precio activo para producto"))
                .getPrice();

            orderItemRepository.save(OrderItem.builder()
                .order(order)
                .product(item.getProduct())
                .productName(item.getProduct().getName())
                .unitPrice(unitPrice)
                .quantity(item.getQuantity())
                .subtotal(unitPrice.multiply(BigDecimal.valueOf(item.getQuantity())))
                .build());

            inventoryService.reserveStock(item.getProduct().getId(), item.getQuantity());
        }

        addStatusHistory(order, null, "PENDING", "Pedido creado");

        if (request.getCouponCode() != null) {
            couponService.redeem(request.getCouponCode(), userId, order.getId());
        }

        cartService.clearCart(userId);

        notificationProducer.sendNotification(NotificationEvent.builder()
            .userId(userId)
            .type("ORDER_CREATED")
            .channel("EMAIL")
            .payload(Map.of("orderNumber", order.getOrderNumber(), "total", total))
            .build());

        auditLogService.log(userId, "ORDER_CREATED", "orders", order.getId(), null,
            Map.of("orderNumber", order.getOrderNumber()));

        return toResponse(order);
    }

    public void updateStatus(Long orderId, Long adminId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado"));

        String previousStatus = order.getStatus();
        order.setStatus(request.getStatus());
        orderRepository.save(order);

        addStatusHistory(order, adminId, request.getStatus(), request.getNote());

        if ("CANCELLED".equals(request.getStatus())) {
            order.getItems().forEach(item ->
                inventoryService.releaseReservation(
                    item.getProduct().getId(), item.getQuantity()));
        }

        if ("PAID".equals(request.getStatus())) {
            order.getItems().forEach(item ->
                inventoryService.confirmSale(
                    item.getProduct().getId(), item.getQuantity()));
        }

        notificationProducer.sendNotification(NotificationEvent.builder()
            .userId(order.getUserId())
            .type("ORDER_STATUS_CHANGED")
            .channel("EMAIL")
            .payload(Map.of(
                "orderNumber", order.getOrderNumber(),
                "newStatus", request.getStatus()))
            .build());

        auditLogService.log(adminId, "ORDER_STATUS_UPDATED", "orders", orderId,
            Map.of("status", previousStatus),
            Map.of("status", request.getStatus()));
    }

    public Page<OrderResponse> listAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable).map(this::toResponse);
    }

    public List<OrderSummaryResponse> listUserOrders(Long userId) {
        return orderRepository.findByUserId(userId).stream()
            .map(o -> OrderSummaryResponse.builder()
                .id(o.getId())
                .orderNumber(o.getOrderNumber())
                .status(o.getStatus())
                .total(o.getTotal())
                .createdAt(o.getCreatedAt())
                .build())
            .collect(Collectors.toList());
    }

    public OrderResponse getOrderDetails(String orderNumber, Long userId) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
            .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado"));

        if (!order.getUserId().equals(userId)) {
            throw new BusinessException("No tienes acceso a este pedido");
        }

        return toResponse(order);
    }

    private String generateOrderNumber() {
        return "ORD-" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE)
             + "-" + String.format("%05d", orderRepository.countToday() + 1);
    }

    private void addStatusHistory(Order order, Long changedBy, String status, String note) {
        orderStatusHistoryRepository.save(OrderStatusHistory.builder()
            .order(order)
            .changedBy(changedBy)
            .status(status)
            .note(note)
            .build());
    }

    private BigDecimal calculateSubtotal(List<CartItem> items) {
        return items.stream()
            .map(item -> {
                BigDecimal price = priceRepository.findActivePrice(item.getProduct().getId())
                    .orElseThrow(() -> new BusinessException("Sin precio activo"))
                    .getPrice();
                return price.multiply(BigDecimal.valueOf(item.getQuantity()));
            })
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
            .map(item -> OrderItemResponse.builder()
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .productName(item.getProductName())
                .unitPrice(item.getUnitPrice())
                .quantity(item.getQuantity())
                .subtotal(item.getSubtotal())
                .build())
            .collect(Collectors.toList());

        return OrderResponse.builder()
            .id(order.getId())
            .orderNumber(order.getOrderNumber())
            .status(order.getStatus())
            .subtotal(order.getSubtotal())
            .shippingCost(order.getShippingCost())
            .discountAmount(order.getDiscountAmount())
            .total(order.getTotal())
            .items(itemResponses)
            .createdAt(order.getCreatedAt())
            .build();
    }
}