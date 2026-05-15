package guide.michelin.security.airecipe.controller;

import guide.michelin.security.airecipe.model.SecurityEvent;
import guide.michelin.security.airecipe.model.SystemSnapshot;
import guide.michelin.security.airecipe.service.TelemetryService;
import guide.michelin.security.airecipe.service.VirtualMemoryEngine;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/security")
public class SecurityController {
    private final TelemetryService telemetryService;
    private final VirtualMemoryEngine memoryEngine;

    public SecurityController(TelemetryService telemetryService, VirtualMemoryEngine memoryEngine) {
        this.telemetryService = telemetryService;
        this.memoryEngine = memoryEngine;
    }

    @GetMapping("/snapshot")
    public SystemSnapshot snapshot() {
        return telemetryService.snapshot();
    }

    @GetMapping("/patterns")
    public List<SecurityEvent> patterns() {
        return memoryEngine.catalog();
    }

    @PostMapping("/backdoor-probe")
    public Map<String, Object> backdoorProbe() {
        return Map.of(
                "allowed", false,
                "mode", "training-only",
                "event", "Backdoor probe denied and converted to telemetry.",
                "sampledAt", Instant.now().toString()
        );
    }
}

