package guide.michelin.security.airecipe.model;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public record SystemSnapshot(
        Instant sampledAt,
        int algorithmAvailability,
        int heapPressure,
        int memoryIntegrity,
        int suspiciousTransitions,
        List<SecurityEvent> events,
        List<String> terminalLogs,
        Map<String, Integer> moduleLoad
) {
}

