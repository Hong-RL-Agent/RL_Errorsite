package edu.research.agrocore.controller;

import edu.research.agrocore.model.AnomalyStatus;
import edu.research.agrocore.model.FarmTelemetry;
import edu.research.agrocore.model.SystemLogEntry;
import edu.research.agrocore.model.ToggleResponse;
import edu.research.agrocore.service.SystemAnomalyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class AgroCoreController {
    private final SystemAnomalyService anomalyService;

    public AgroCoreController(SystemAnomalyService anomalyService) {
        this.anomalyService = anomalyService;
    }

    @GetMapping("/telemetry")
    FarmTelemetry telemetry() {
        return anomalyService.telemetry();
    }

    @GetMapping("/anomalies")
    List<AnomalyStatus> anomalies() {
        return anomalyService.anomalies();
    }

    @GetMapping("/logs")
    List<SystemLogEntry> logs() {
        return anomalyService.logs();
    }

    @PostMapping("/anomalies/{id}/toggle")
    ResponseEntity<ToggleResponse> toggle(@PathVariable String id) {
        return ResponseEntity.ok(new ToggleResponse(id, anomalyService.toggle(id)));
    }

    @PostMapping("/actions/historical-analysis")
    ResponseEntity<Void> historicalAnalysis() {
        anomalyService.runHistoricalAnalysis();
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/actions/leaf-analysis")
    ResponseEntity<Void> leafAnalysis() {
        anomalyService.runLeafAnalysisTransfer();
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/actions/archive-flush")
    ResponseEntity<Void> archiveFlush() {
        anomalyService.archiveRemoteFlush();
        return ResponseEntity.accepted().build();
    }
}
