package guide.michelin.security.airecipe.model;

public record SecurityEvent(
        String id,
        String pattern,
        String severity,
        String signal,
        String simulatedVector,
        String mitigation
) {
}

