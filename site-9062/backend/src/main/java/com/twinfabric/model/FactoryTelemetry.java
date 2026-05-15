package com.twinfabric.model;

import java.time.Instant;
import java.util.List;

public record FactoryTelemetry(
        Instant timestamp,
        String activeTraceId,
        List<MetricPoint> stream,
        List<MachineState> machines,
        List<NodeHealth> nodes
) {
}

