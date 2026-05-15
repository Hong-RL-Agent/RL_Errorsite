package gallery.noir.artappraiser.service;

import gallery.noir.artappraiser.model.ApiModels.SecurityEvent;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class SecurityEventService {
    private final List<SecurityEvent> events = new ArrayList<>();

    public SecurityEventService() {
        record("INFO", "BOOT", "ART-APPRAISER security telemetry initialized on localhost:9090");
        record("WARN", "AUTH", "Training mode uses long-lived sessions and weak password acceptance.");
        record("INFO", "DATA", "Seeded vulnerable gallery records and report log data.");
    }

    public synchronized void record(String severity, String vector, String message) {
        events.add(new SecurityEvent(Instant.now(), severity, vector, message));
        if (events.size() > 200) {
            events.remove(0);
        }
    }

    public synchronized List<SecurityEvent> latest() {
        return events.stream()
                .sorted(Comparator.comparing(SecurityEvent::timestamp).reversed())
                .limit(80)
                .toList();
    }
}
