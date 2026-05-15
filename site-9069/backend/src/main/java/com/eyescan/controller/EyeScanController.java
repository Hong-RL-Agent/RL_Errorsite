package com.eyescan.controller;

import com.eyescan.model.FaultScenario;
import com.eyescan.model.TelemetrySnapshot;
import com.eyescan.service.FaultScenarioService;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class EyeScanController {
    private final FaultScenarioService scenarioService;

    public EyeScanController(FaultScenarioService scenarioService) {
        this.scenarioService = scenarioService;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of(
                "status", "UP",
                "service", "EYE-SCAN",
                "port", 9069,
                "timestamp", Instant.now().toString()
        );
    }

    @GetMapping("/scenarios")
    public List<FaultScenario> scenarios() {
        return scenarioService.scenarios();
    }

    @GetMapping("/telemetry")
    public ResponseEntity<TelemetrySnapshot> telemetry() {
        TelemetrySnapshot snapshot = scenarioService.snapshot();
        return ResponseEntity.ok()
                .header("X-EYE-SCAN-Trace", "port-9069-relative-api")
                .header("X-Clock-Skew-Ms", String.valueOf(snapshot.clockSkew().az2Ms()))
                .body(snapshot);
    }
}

