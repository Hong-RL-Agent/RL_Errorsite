package com.twinfabric.model;

public record NodeHealth(
        String nodeId,
        String region,
        String reportedHealth,
        String internalComponent,
        boolean componentOnline,
        int latencyMs,
        int cpuLoad,
        int memoryLoad
) {
}

