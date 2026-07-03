package com.ecommerce.catalog.service;

import com.ecommerce.catalog.entity.Inventory;
import com.ecommerce.catalog.repository.InventoryRepository;
import com.ecommerce.shared.exception.BusinessException;
import com.ecommerce.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    @Transactional
    public void reserveStock(Long productId, int quantity) {
        Inventory inv = inventoryRepository.findByProductIdForUpdate(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Inventario no encontrado"));

        if (inv.getAvailableStock() < quantity) {
            throw new BusinessException("Stock insuficiente para el producto: " + productId);
        }

        inv.setAvailableStock(inv.getAvailableStock() - quantity);
        inv.setReservedStock(inv.getReservedStock() + quantity);
        inventoryRepository.save(inv);
    }

    @Transactional
    public void confirmSale(Long productId, int quantity) {
        Inventory inv = inventoryRepository.findByProductIdForUpdate(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Inventario no encontrado"));

        inv.setReservedStock(inv.getReservedStock() - quantity);
        inventoryRepository.save(inv);
    }

    @Transactional
    public void releaseReservation(Long productId, int quantity) {
        Inventory inv = inventoryRepository.findByProductIdForUpdate(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Inventario no encontrado"));

        inv.setAvailableStock(inv.getAvailableStock() + quantity);
        inv.setReservedStock(Math.max(0, inv.getReservedStock() - quantity));
        inventoryRepository.save(inv);
    }
}