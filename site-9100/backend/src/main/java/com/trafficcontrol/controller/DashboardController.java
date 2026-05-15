package com.trafficcontrol.controller;

import com.trafficcontrol.model.DashboardSnapshot;
import com.trafficcontrol.model.DbEvent;
import com.trafficcontrol.service.DbFaultSimulationService;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class DashboardController {
    private final DbFaultSimulationService service;

    public DashboardController(DbFaultSimulationService service) {
        this.service = service;
    }

    @GetMapping("/dashboard")
    DashboardSnapshot dashboard() {
        return service.snapshot();
    }

    @GetMapping("/health")
    Map<String, String> health() {
        return Map.of("service", "TRAFFIC-CONTROL", "port", "9100", "status", "UP");
    }

    @PostMapping("/faults/lock-contention")
    DbEvent lockContention() {
        return service.provokeLockContention();
    }

    @PostMapping("/faults/connection-leak")
    DbEvent connectionLeak() {
        return service.leakConnection();
    }

    @PostMapping("/faults/slow-plan")
    DbEvent slowPlan() {
        return service.runSlowPlan();
    }

    @PostMapping("/faults/migration-failure")
    DbEvent migrationFailure() {
        return service.simulateMigrationFailure();
    }
}
