package lab.trustvote.model;

import java.time.Instant;
import java.util.Map;

public record SecuritySnapshot(
        long blockHeight,
        int activeVoters,
        long averageLatencyMs,
        long throughputPerMinute,
        boolean writebackErrorPending,
        boolean gpuImplicitSyncStalled,
        boolean memoryCompactionLivelock,
        boolean journalMirroringEnabled,
        Map<String, Integer> tally,
        Map<String, Long> subsystemLatencyMs,
        Instant sampledAt
) {
}

