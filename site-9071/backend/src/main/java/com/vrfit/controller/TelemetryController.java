package com.vrfit.controller;

import com.vrfit.model.DashboardSnapshot;
import com.vrfit.model.ScenarioStatus;
import com.vrfit.service.TelemetryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class TelemetryController {
    private final TelemetryService telemetryService;

    public TelemetryController(TelemetryService telemetryService) {
        this.telemetryService = telemetryService;
    }

    @GetMapping("/telemetry")
    public ResponseEntity<DashboardSnapshot> telemetry() {
        return ResponseEntity.ok()
                .header("X-VR-FIT-Trace", "vrfit-9071-live")
                .body(telemetryService.snapshot());
    }

    @GetMapping("/scenarios")
    public List<ScenarioStatus> scenarios() {
        return telemetryService.scenarios();
    }
}
