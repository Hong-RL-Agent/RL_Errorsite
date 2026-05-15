package com.biopay.model;

import java.util.List;

public record FaultProbe(
        int scenarioId,
        String phase,
        String status,
        List<String> observedEvents,
        String simulatedRootCause,
        String recommendedGuardrail
) {
}
