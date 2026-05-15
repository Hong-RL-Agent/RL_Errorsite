package lab.vitalink.telemetry;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public record TelemetrySnapshot(
        Instant timestamp,
        boolean sessionAlive,
        int dirtyBuffer,
        long irqCount,
        long spinlockContentions,
        long pageFaultStormWrites,
        long unalignedAccessWarnings,
        long simulatedMemoryPercent,
        long globalSlowdownRemainingMs,
        List<String> kernelWarnings,
        Map<String, Long> endpointLatencyMs
) {
}
