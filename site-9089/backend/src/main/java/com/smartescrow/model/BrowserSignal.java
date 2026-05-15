package com.smartescrow.model;

import jakarta.validation.constraints.NotBlank;

import java.time.Instant;
import java.util.Map;

public record BrowserSignal(
        @NotBlank String type,
        String route,
        String permission,
        Map<String, Object> payload,
        Instant clientTime
) {
}
