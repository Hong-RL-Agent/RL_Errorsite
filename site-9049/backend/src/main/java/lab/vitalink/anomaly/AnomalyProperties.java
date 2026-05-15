package lab.vitalink.anomaly;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "vita")
public record AnomalyProperties(
        int dirtyThreshold,
        long dirtyWritebackMs,
        long numaLatencyMs,
        long irqFreezeMs,
        long cpuJitterMinMs,
        long cpuJitterMaxMs,
        boolean noisyNeighborEnabled,
        long noisyNeighborPeriodMs,
        long noisyNeighborSpinMs,
        long avxDownclockMs,
        double smiProbability,
        long smiLatencyMs,
        boolean oomEnabled,
        long oomTickMs,
        int oomIncrementPercent,
        int cowBufferMb,
        int cowThreads
) {
}
