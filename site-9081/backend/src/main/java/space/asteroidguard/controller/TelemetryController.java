package space.asteroidguard.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import space.asteroidguard.model.GuardModels.TelemetrySnapshot;
import space.asteroidguard.service.TelemetryService;

@RestController
@RequestMapping("/api")
public class TelemetryController {
    private final TelemetryService telemetryService;

    public TelemetryController(TelemetryService telemetryService) {
        this.telemetryService = telemetryService;
    }

    @GetMapping("/telemetry")
    public TelemetrySnapshot telemetry() {
        return telemetryService.snapshot();
    }
}

