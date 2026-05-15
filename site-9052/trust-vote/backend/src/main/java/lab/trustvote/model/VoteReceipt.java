package lab.trustvote.model;

import java.time.Instant;
import java.util.List;

public record VoteReceipt(
        String receiptId,
        String blockHash,
        long blockHeight,
        long latencyMs,
        boolean accepted,
        String writebackStatus,
        Instant acceptedAt,
        List<String> regressionsApplied
) {
}

