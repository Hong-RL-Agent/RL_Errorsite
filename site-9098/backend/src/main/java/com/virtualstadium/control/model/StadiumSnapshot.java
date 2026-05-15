package com.virtualstadium.control.model;

import java.time.Instant;
import java.util.List;

public record StadiumSnapshot(
        String venue,
        Instant timestamp,
        int liveViewers,
        int concurrentSessions,
        double fanPulse,
        double streamBitrateGbps,
        double packetLossPercent,
        List<HeatCell> heatmap,
        NetworkTelemetry network,
        List<Incident> incidents,
        List<OperationLog> operationLogs
) {
}
