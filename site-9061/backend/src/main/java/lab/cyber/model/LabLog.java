package lab.cyber.model;

import java.time.Instant;

public record LabLog(Instant timestamp, String severity, String source, String message) {
}
