package com.twinfabric.model;

import java.time.Instant;

public record MetricPoint(
        Instant time,
        String channel,
        String value,
        String severity
) {
}

