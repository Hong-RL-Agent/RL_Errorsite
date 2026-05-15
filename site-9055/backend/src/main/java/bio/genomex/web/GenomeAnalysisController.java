package bio.genomex.web;

import bio.genomex.model.SequencingFrame;
import bio.genomex.model.TelemetrySnapshot;
import bio.genomex.service.GenomeAnalysisService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@CrossOrigin(origins = "*")
public class GenomeAnalysisController {
    private final GenomeAnalysisService service;

    public GenomeAnalysisController(GenomeAnalysisService service) {
        this.service = service;
    }

    @PostMapping("/api/analysis/start")
    public ResponseEntity<TelemetrySnapshot> start(
            @RequestParam(defaultValue = "0.62") @Min(0) @Max(1) double intensity
    ) {
        return ResponseEntity.ok(service.startRun(intensity));
    }

    @PostMapping("/api/analysis/stop")
    public ResponseEntity<TelemetrySnapshot> stop() {
        return ResponseEntity.ok(service.stopRun());
    }

    @GetMapping("/api/telemetry")
    public TelemetrySnapshot telemetry() {
        return service.snapshot();
    }

    @GetMapping("/api/sequencing")
    public SequencingFrame sequencing() {
        return service.sequencingFrame();
    }
}
