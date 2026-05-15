package org.digitalheritage.model;

public record DisasterLog(
        String time,
        String channel,
        String level,
        String message
) {
}
