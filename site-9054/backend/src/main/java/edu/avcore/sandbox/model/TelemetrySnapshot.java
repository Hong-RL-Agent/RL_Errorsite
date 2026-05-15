package edu.avcore.sandbox.model;

import java.time.Instant;
import java.util.List;

public record TelemetrySnapshot(
        Instant timestamp,
        double speedKph,
        double steeringAngle,
        double batteryPercent,
        double cpuLoad,
        double gpuMemoryFragmentation,
        double packetLoss,
        double pathConfidence,
        double latencyMs,
        boolean clockFrozen,
        List<RegressionSignal> regressions,
        List<EventLogEntry> events
) {
}
