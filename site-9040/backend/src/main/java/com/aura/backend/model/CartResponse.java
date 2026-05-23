package com.aura.backend.model;

public record CartResponse(
        String userId,
        int total
) {
}
