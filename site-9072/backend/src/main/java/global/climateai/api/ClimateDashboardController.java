package global.climateai.api;

import global.climateai.service.ClimateTelemetryService;
import global.climateai.service.DashboardSnapshot;
import java.time.Instant;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ClimateDashboardController {
    private final ClimateTelemetryService telemetryService;

    public ClimateDashboardController(ClimateTelemetryService telemetryService) {
        this.telemetryService = telemetryService;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of(
            "service", "CLIMATE-AI",
            "status", "DEGRADED_LAB_MODE",
            "port", 9072,
            "timestamp", Instant.now().toString()
        );
    }

    @GetMapping("/dashboard")
    public DashboardSnapshot dashboard() {
        return telemetryService.snapshot();
    }
}

