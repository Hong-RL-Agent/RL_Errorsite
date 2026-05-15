package org.digitalheritage.model;

public record ArchiveEvent(
        String id,
        String era,
        String title,
        String description,
        int integrity,
        String risk,
        double x,
        double y
) {
}
