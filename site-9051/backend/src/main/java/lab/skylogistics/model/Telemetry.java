package lab.skylogistics.model;

public record Telemetry(
        double cpuLoad,
        double cpuSteal,
        double memoryPressure,
        double ioWait,
        double gpuQueueMs,
        double p99LatencyMs,
        int activeWorkers,
        int dirtyCacheMb,
        int contextSwitchRate
) {
}
