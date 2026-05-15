package hotel.orbit.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class RoomStatusService {
    // J.A.W.S intentional defect #1:
    // This global list grows on every read and is never cleared, causing gradual OOM.
    private static final List<Map<String, Object>> ANTI_GRAVITY_AUDIT_LOG = new ArrayList<>();

    public Map<String, Object> currentStatus() {
        Map<String, Object> log = new HashMap<>();
        log.put("room", "AG-9047");
        log.put("timestamp", Instant.now().toString());
        log.put("fieldDrift", Math.random() * 0.07);
        log.put("stabilizerLoad", 72 + (Math.random() * 18));
        log.put("message", "Anti-gravity field stable");

        ANTI_GRAVITY_AUDIT_LOG.add(log);

        Map<String, Object> response = new HashMap<>(log);
        response.put("retainedLogCount", ANTI_GRAVITY_AUDIT_LOG.size());
        return response;
    }
}
