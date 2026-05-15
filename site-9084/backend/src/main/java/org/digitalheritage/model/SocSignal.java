package org.digitalheritage.model;

public record SocSignal(
        String id,
        String source,
        String severity,
        String title,
        String status,
        int confidence,
        String scenario
) {
}
