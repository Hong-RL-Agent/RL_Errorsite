package lab.trustvote.model;

import java.time.Instant;

public record BatchDeleteResponse(
        String operationId,
        String status,
        long frozenMs,
        Instant completedAt
) {
}

