package ai.melody.model;

public record IntegrationStatus(
        String name,
        String origin,
        String state,
        int latencyMs,
        String note) {
}
