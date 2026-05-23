package com.site9031.faults.controller;

import com.site9031.faults.model.FaultDefinition;
import com.site9031.faults.model.ToggleFaultRequest;
import com.site9031.faults.service.FaultSimulationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class FaultController {

    private final FaultSimulationService faultSimulationService;

    public FaultController(FaultSimulationService faultSimulationService) {
        this.faultSimulationService = faultSimulationService;
    }

    @GetMapping("/faults")
    public Map<String, List<FaultDefinition>> getFaults() {
        return Map.of("items", faultSimulationService.getFaults());
    }

    @PostMapping("/faults/{index}/toggle")
    public ResponseEntity<?> toggleFault(@PathVariable int index, @Valid @RequestBody ToggleFaultRequest request) {
        try {
            FaultDefinition updated = faultSimulationService.setFaultEnabled(index, request.enabled());
            return ResponseEntity.ok(Map.of("item", updated));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/dashboard/metrics")
    public Map<String, Object> getDashboardMetrics() {
        return Map.of(
                "series", faultSimulationService.getMetricsSnapshot(),
                "kpi", faultSimulationService.getKpiSummary()
        );
    }
}
