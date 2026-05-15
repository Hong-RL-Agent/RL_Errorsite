package com.biopay.controller;

import com.biopay.model.DashboardSnapshot;
import com.biopay.model.DefectScenario;
import com.biopay.model.FaultProbe;
import com.biopay.service.DashboardService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class DashboardController {
    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardSnapshot> dashboard() {
        return ResponseEntity.ok()
                .header("X-BIOPAY-Trace", "port-9064-cors-verified")
                .body(dashboardService.snapshot());
    }

    @GetMapping("/defects")
    public List<DefectScenario> defects() {
        return dashboardService.defects();
    }

    @GetMapping("/defects/{id}/probe")
    public FaultProbe probe(@PathVariable int id) {
        return dashboardService.probe(id);
    }
}
