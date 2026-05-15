package lab.neurolink.model;

public record LogEntry(
        String timestamp,
        String level,
        String source,
        String message
) {
}

