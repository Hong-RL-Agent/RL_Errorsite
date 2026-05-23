package com.aura.backend.model;

import jakarta.validation.constraints.NotNull;

public record CartItemRequest(
        @NotNull Long productId,
        @NotNull Integer quantity,
        @NotNull Integer unitPrice
) {
}
