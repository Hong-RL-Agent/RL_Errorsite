package com.virtualestate.model;

import java.util.List;

public record DashboardResponse(
        String platform,
        String entrypoint,
        Metrics metrics,
        List<Asset> assets,
        List<WirelessSignal> wirelessSignals,
        List<SecurityEvent> events
) {
    public record Metrics(
            long totalManagedValueUsd,
            int activeListings,
            int hybridRiskScore,
            int ppoDetectionConfidence,
            int openCriticalEvents
    ) {
    }
}
