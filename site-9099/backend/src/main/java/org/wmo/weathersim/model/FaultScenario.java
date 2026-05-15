package org.wmo.weathersim.model;

public record FaultScenario(
        String id,
        String name,
        String layer,
        String severity,
        String symptom,
        String ppoSignal,
        String remediation
) {
}

