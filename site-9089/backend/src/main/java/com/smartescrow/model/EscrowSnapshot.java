package com.smartescrow.model;

import java.time.Instant;
import java.util.List;

public record EscrowSnapshot(
        String network,
        long blockHeight,
        double lockedValue,
        int pendingApprovals,
        int anomalyCount,
        List<String> signers,
        List<String> ledger,
        Instant generatedAt
) {
}
