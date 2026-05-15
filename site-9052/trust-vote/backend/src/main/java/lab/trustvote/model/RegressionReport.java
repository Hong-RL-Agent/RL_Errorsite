package lab.trustvote.model;

import java.time.Instant;

public record RegressionReport(
        int id,
        String name,
        String subsystem,
        String status,
        String impact,
        long penaltyMs,
        Instant lastTriggeredAt
) {
}

