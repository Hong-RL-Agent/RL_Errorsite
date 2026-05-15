package com.vrfit.model;

public record AiTelemetry(
        double poseLatencyMs,
        double inferenceQueueDepth,
        double circuitBreakerFallbackRate,
        double threadLocalBleedRisk,
        String timezoneDrift,
        double confidence
) {
}
