package org.wmo.weathersim.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.wmo.weathersim.model.FaultScenario;
import org.wmo.weathersim.model.RegionStatus;
import org.wmo.weathersim.model.TelemetryPoint;
import org.wmo.weathersim.model.WeatherOverview;
import org.wmo.weathersim.service.WeatherOpsService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class WeatherOpsController {
    private final WeatherOpsService service;

    public WeatherOpsController(WeatherOpsService service) {
        this.service = service;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP", "origin", "http://localhost:9099", "system", "WEATHER-SIM");
    }

    @GetMapping("/overview")
    public WeatherOverview overview() {
        return service.overview();
    }

    @GetMapping("/regions")
    public List<RegionStatus> regions() {
        return service.regions();
    }

    @GetMapping("/telemetry")
    public List<TelemetryPoint> telemetry() {
        return service.telemetry();
    }

    @GetMapping("/faults")
    public List<FaultScenario> faults() {
        return service.faults();
    }
}

