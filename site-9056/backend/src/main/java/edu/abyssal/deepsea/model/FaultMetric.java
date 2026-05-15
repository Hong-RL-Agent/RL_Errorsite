package edu.abyssal.deepsea.model;

public record FaultMetric(
        String id,
        String name,
        String subsystem,
        double severity,
        double latencyMs,
        String status,
        String evidence
) {
}
