package com.eyescan.model;

public record FaultScenario(
        int id,
        String code,
        String title,
        String faultClass,
        String symptom,
        String learningSignal,
        int severity,
        int driftScore,
        int latencyMs,
        boolean active
) {
}

