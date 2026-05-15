package com.deepsea.data.model;

import java.time.Instant;
import java.util.List;

public final class TelemetryModels {
    private TelemetryModels() {
    }

    public record HealthStatus(String service, String status, String port, Instant timestamp) {
    }

    public record CableTraffic(String route, String region, double throughputTbps, double packetLoss, double latencyMs,
                               String status) {
    }

    public record CoolingMetric(String zone, double efficiency, double inletCelsius, double pumpRpm, String risk) {
    }

    public record QueueLag(String broker, String topic, long lag, long consumerRate, long producerRate,
                           String pressure) {
    }

    public record AvailabilityLog(Instant timestamp, String level, String subsystem, String message) {
    }

    public record FaultPattern(int id, String name, String severity, String signal, String simulatedDefect,
                               String learningObjective) {
    }

    public record DashboardSnapshot(Instant generatedAt, double globalAvailability, double activePowerMw,
                                    double thermalHeadroom, List<CableTraffic> cables,
                                    List<CoolingMetric> cooling, List<QueueLag> queues,
                                    List<FaultPattern> faultPatterns, List<AvailabilityLog> logs) {
    }
}
