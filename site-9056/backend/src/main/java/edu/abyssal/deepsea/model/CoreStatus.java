package edu.abyssal.deepsea.model;

import java.time.Instant;
import java.util.List;

public record CoreStatus(
        Instant timestamp,
        double depthMeters,
        double pressureBar,
        double oxygenPercent,
        double powerPercent,
        double cpuTemperatureC,
        double cpuClockGhz,
        double stealTimePercent,
        double pcieThroughputGbps,
        double sonarIntegrity,
        List<Double> depthSeries,
        List<Double> pressureSeries,
        List<Integer> terrainGrid,
        List<FaultMetric> faults,
        List<String> eventLog
) {
}
