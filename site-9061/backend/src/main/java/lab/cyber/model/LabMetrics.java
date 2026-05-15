package lab.cyber.model;

import java.time.Instant;
import java.util.List;

public record LabMetrics(
        Instant timestamp,
        double cpu,
        double memory,
        double ioWait,
        double latency,
        double packetRate,
        double jitter,
        List<Double> cpuSeries,
        List<Double> memorySeries,
        List<Double> ioSeries
) {
}
