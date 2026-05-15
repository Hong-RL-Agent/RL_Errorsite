package com.metamart.sim;

import java.util.List;
import java.util.Map;

public record TelemetrySnapshot(
        long requestCount,
        int activeCore,
        int transactionLogEntries,
        long simulatedVramMb,
        List<TelemetryEvent> recentEvents,
        Map<String, Long> counters
) {
}
