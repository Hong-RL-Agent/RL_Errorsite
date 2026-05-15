package edu.avcore.sandbox.model;

import java.time.Instant;

public record EventLogEntry(
        Instant timestamp,
        String severity,
        String source,
        String message
) {
}
