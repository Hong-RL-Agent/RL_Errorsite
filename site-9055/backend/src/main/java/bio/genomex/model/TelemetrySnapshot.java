package bio.genomex.model;

import java.time.Instant;
import java.util.List;

public record TelemetrySnapshot(
        Instant timestamp,
        String runId,
        boolean running,
        double progress,
        double throughputGbPerHour,
        double p95LatencyMs,
        double cpuCore0,
        double cpuOtherCores,
        double memoryPressure,
        double iops,
        double gpuLaunchRate,
        String activeStage,
        List<Bottleneck> bottlenecks
) {
}
