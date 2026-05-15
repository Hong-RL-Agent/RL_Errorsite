package edu.research.agrocore.model;

import java.time.Instant;
import java.util.List;

public record FarmTelemetry(
        Instant wallClock,
        Instant farmClock,
        double soilMoisture,
        double canopyTemperature,
        double co2Ppm,
        double lightLux,
        double pumpPressure,
        double aiGrowthFps,
        double apiLatencyMs,
        double memoryPressure,
        double diskIoPressure,
        double pcieSaturation,
        double workqueueDepth,
        double ringBusContention,
        double numaFlushLatencyMs,
        List<AnomalyStatus> anomalies
) {
}
