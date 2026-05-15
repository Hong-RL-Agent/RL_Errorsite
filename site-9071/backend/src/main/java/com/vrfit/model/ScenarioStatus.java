package com.vrfit.model;

public record ScenarioStatus(
        int id,
        String code,
        String title,
        String subsystem,
        String severity,
        double risk,
        double latencyMs,
        double packetLoss,
        String symptom,
        String ppoSignal,
        boolean active
) {
}
