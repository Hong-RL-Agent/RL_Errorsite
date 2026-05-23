package com.aura.backend.controller;

import com.aura.backend.model.OrderResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private static final Map<Long, OrderResponse> ORDERS = Map.of(
            1001L, new OrderResponse(1001L, "user-1", "Obsidian Coat", 1, 890),
            1002L, new OrderResponse(1002L, "user-2", "Luna Silk Dress", 1, 1240),
            1003L, new OrderResponse(1003L, "user-3", "Noir Tote", 2, 1040)
    );

    @GetMapping("/{id}")
    public OrderResponse getOrder(@PathVariable Long id) {
        return ORDERS.getOrDefault(id, new OrderResponse(id, "unknown", "N/A", 0, 0));
    }
}
