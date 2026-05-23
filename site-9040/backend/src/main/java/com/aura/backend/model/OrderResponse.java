package com.aura.backend.model;

public record OrderResponse(
        long id,
        String userId,
        String item,
        int quantity,
        int totalPrice
) {
}
