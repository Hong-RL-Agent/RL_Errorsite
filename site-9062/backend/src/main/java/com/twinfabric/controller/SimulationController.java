package com.twinfabric.controller;

import com.twinfabric.model.FactoryTelemetry;
import com.twinfabric.model.RecoveryScenario;
import com.twinfabric.model.ScenarioTriggerResult;
import com.twinfabric.service.RecoverySimulationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class SimulationController {
    private final RecoverySimulationService simulationService;

    public SimulationController(RecoverySimulationService simulationService) {
        this.simulationService = simulationService;
    }

    @GetMapping("/telemetry")
    public FactoryTelemetry telemetry() {
        return simulationService.telemetry();
    }

    @GetMapping("/scenarios")
    public List<RecoveryScenario> scenarios() {
        return simulationService.scenarios();
    }

    @PostMapping("/scenarios/{id}/trigger")
    public ScenarioTriggerResult trigger(@PathVariable int id) {
        return simulationService.trigger(id);
    }

    @GetMapping("/health/synthetic")
    public Map<String, Object> syntheticHealth() {
        return simulationService.misleadingHealth();
    }
}

