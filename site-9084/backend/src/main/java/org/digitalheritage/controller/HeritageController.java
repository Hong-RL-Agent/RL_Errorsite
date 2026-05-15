package org.digitalheritage.controller;

import org.digitalheritage.model.HeritageDashboard;
import org.digitalheritage.service.HeritageSimulationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/heritage")
public class HeritageController {
    private final HeritageSimulationService heritageSimulationService;

    public HeritageController(HeritageSimulationService heritageSimulationService) {
        this.heritageSimulationService = heritageSimulationService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<HeritageDashboard> dashboard() {
        return ResponseEntity.ok()
                .header("X-DH-Archive-Trace", "localhost:9084")
                .header("X-DH-Continuity-State", "simulation")
                .body(heritageSimulationService.dashboard());
    }
}
