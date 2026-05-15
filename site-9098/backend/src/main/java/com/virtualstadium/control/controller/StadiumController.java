package com.virtualstadium.control.controller;

import com.virtualstadium.control.model.Incident;
import com.virtualstadium.control.model.StadiumSnapshot;
import com.virtualstadium.control.service.StadiumTelemetryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stadium")
public class StadiumController {
    private final StadiumTelemetryService telemetryService;

    public StadiumController(StadiumTelemetryService telemetryService) {
        this.telemetryService = telemetryService;
    }

    @GetMapping("/snapshot")
    public StadiumSnapshot snapshot() {
        return telemetryService.currentSnapshot();
    }

    @GetMapping("/incidents")
    public List<Incident> incidents() {
        return telemetryService.incidents();
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of(
                "service", "VIRTUAL-STADIUM",
                "portPolicy", "frontend-public-port-9098",
                "apiBase", "/api",
                "status", "DEGRADED_SIMULATION"
        );
    }
}
