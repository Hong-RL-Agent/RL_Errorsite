package edu.avcore.sandbox.model;

public record RegressionSignal(
        String id,
        String name,
        String subsystem,
        String severity,
        boolean enabled,
        double pressure,
        long events,
        String description
) {
}
