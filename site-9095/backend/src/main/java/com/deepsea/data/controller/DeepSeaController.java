package com.deepsea.data.controller;

import com.deepsea.data.model.TelemetryModels.DashboardSnapshot;
import com.deepsea.data.model.TelemetryModels.FaultPattern;
import com.deepsea.data.model.TelemetryModels.HealthStatus;
import com.deepsea.data.service.AvailabilitySimulationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api")
public class DeepSeaController {
    private final AvailabilitySimulationService simulationService;

    @Value("${server.port:9095}")
    private String serverPort;

    public DeepSeaController(AvailabilitySimulationService simulationService) {
        this.simulationService = simulationService;
    }

    @GetMapping("/health")
    public HealthStatus health() {
        return new HealthStatus("DEEP-SEA-DATA", "PRESSURIZED", serverPort, Instant.now());
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardSnapshot> dashboard() {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(simulationService.snapshot());
    }

    @GetMapping("/fault-patterns")
    public ResponseEntity<List<FaultPattern>> faultPatterns() {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(30, TimeUnit.SECONDS))
                .body(simulationService.faultPatterns());
    }
}
