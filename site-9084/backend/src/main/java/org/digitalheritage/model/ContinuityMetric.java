package org.digitalheritage.model;

public record ContinuityMetric(
        String label,
        int current,
        int target,
        String unit,
        String state,
        String detail
) {
}
