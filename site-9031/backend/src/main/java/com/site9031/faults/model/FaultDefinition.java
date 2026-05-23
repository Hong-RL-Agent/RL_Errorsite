package com.site9031.faults.model;

public record FaultDefinition(
        int index,
        String key,
        String title,
        String symptom,
        String severity,
        boolean enabled
) {
}
