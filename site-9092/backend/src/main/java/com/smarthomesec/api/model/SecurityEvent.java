package com.smarthomesec.api.model;

import java.time.Instant;

public record SecurityEvent(
        Instant time,
        String severity,
        String source,
        String message
) {
}
