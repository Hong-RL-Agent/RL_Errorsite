package bio.genomex.model;

public record Bottleneck(
        String id,
        String name,
        String layer,
        String symptom,
        String businessTrigger,
        double severity,
        long lastLatencyMs,
        long occurrences
) {
}
