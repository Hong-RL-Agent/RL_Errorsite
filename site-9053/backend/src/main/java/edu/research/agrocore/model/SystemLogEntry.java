package edu.research.agrocore.model;

import java.time.Instant;

public record SystemLogEntry(
        Instant timestamp,
        String level,
        String subsystem,
        String message
) {
}
