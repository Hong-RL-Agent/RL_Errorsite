package lab.neurolink.controller;

import lab.neurolink.model.DefectScenario;
import lab.neurolink.model.NeuroSnapshot;
import lab.neurolink.service.NeuroTelemetryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class NeuroTelemetryController {
    private final NeuroTelemetryService telemetryService;

    public NeuroTelemetryController(NeuroTelemetryService telemetryService) {
        this.telemetryService = telemetryService;
    }

    @GetMapping("/snapshot")
    public ResponseEntity<NeuroSnapshot> snapshot() {
        return ResponseEntity.ok()
                .header("X-NEURO-LINK-Trace", "port-9065")
                .body(telemetryService.snapshot());
    }

    @GetMapping("/scenarios")
    public List<DefectScenario> scenarios() {
        return telemetryService.scenarios();
    }
}

