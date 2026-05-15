package lab.vitalink.telemetry;

import lab.vitalink.anomaly.SystemAnomalyService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/telemetry")
@CrossOrigin
public class TelemetryController {
    private final SystemAnomalyService anomalyService;

    public TelemetryController(SystemAnomalyService anomalyService) {
        this.anomalyService = anomalyService;
    }

    @GetMapping
    public TelemetrySnapshot snapshot() {
        return anomalyService.snapshot();
    }

    @PostMapping("/reset-session")
    public Map<String, Object> resetSession() {
        anomalyService.resetSession();
        return Map.of("sessionAlive", true, "status", "clinical session state restored");
    }
}
