package edu.research.agrocore.model;

public record AnomalyStatus(
        String id,
        String name,
        String subsystem,
        String severity,
        boolean enabled,
        double intensity,
        String signal,
        String mitigation
) {
}
