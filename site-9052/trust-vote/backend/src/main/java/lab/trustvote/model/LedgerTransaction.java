package lab.trustvote.model;

import java.time.Instant;

public record LedgerTransaction(
        String id,
        long height,
        String hash,
        String candidate,
        String precinct,
        String state,
        long latencyMs,
        Instant timestamp
) {
}

