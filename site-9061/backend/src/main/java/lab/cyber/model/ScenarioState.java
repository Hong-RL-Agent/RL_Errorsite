package lab.cyber.model;

import java.time.Instant;

public record ScenarioState(
        String id,
        String name,
        String status,
        Instant lastTriggeredAt,
        String signal
) {
}
