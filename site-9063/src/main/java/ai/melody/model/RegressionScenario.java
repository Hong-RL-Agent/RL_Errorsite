package ai.melody.model;

import java.util.List;

public record RegressionScenario(
        int id,
        String name,
        Severity severity,
        String subsystem,
        String trigger,
        String simulatedFault,
        String guardrail,
        String currentState,
        List<String> telemetry) {
}
