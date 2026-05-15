package com.twinfabric.model;

import java.time.Instant;

public record ScenarioTriggerResult(
        int id,
        String key,
        String traceId,
        String result,
        String observation,
        Instant timestamp
) {
}

