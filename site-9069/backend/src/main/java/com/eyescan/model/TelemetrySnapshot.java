package com.eyescan.model;

import java.time.Instant;
import java.util.List;

public record TelemetrySnapshot(
        String system,
        Instant timestamp,
        List<ZoneStatus> zones,
        ClockSkew clockSkew,
        ThrottleGauge throttle,
        List<CctvFeed> feeds,
        List<FaultScenario> scenarios
) {
    public record ZoneStatus(String name, String status, int replicationLagMs, int packetLossPermille) {
    }

    public record ClockSkew(int az1Ms, int az2Ms, int az3Ms, String orderingRisk) {
    }

    public record ThrottleGauge(int cpuPercent, int networkPercent, int apiBudgetPercent, int syntheticLatencyMs) {
    }

    public record CctvFeed(String id, String sector, String signal, int motionScore, String anomaly) {
    }
}

