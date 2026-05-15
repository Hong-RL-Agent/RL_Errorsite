package com.metamart.sim;

import java.time.Instant;

public record TelemetryEvent(
        Instant timestamp,
        String pattern,
        String severity,
        long latencyMs,
        String detail
) {
}
