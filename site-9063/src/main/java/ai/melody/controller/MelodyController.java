package ai.melody.controller;

import ai.melody.model.CompositionStatus;
import ai.melody.model.IntegrationStatus;
import ai.melody.model.RegressionScenario;
import ai.melody.service.CompositionService;
import ai.melody.service.RegressionScenarioService;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class MelodyController {
    private final CompositionService compositionService;
    private final RegressionScenarioService regressionScenarioService;

    public MelodyController(
            CompositionService compositionService,
            RegressionScenarioService regressionScenarioService) {
        this.compositionService = compositionService;
        this.regressionScenarioService = regressionScenarioService;
    }

    @GetMapping("/system/status")
    public ResponseEntity<Map<String, Object>> systemStatus() {
        return ResponseEntity.ok()
                .header("X-MELODY-Trace", "melody-ai-port-9063")
                .header("X-Recovery-Plan", "guarded-regression-sandbox")
                .body(Map.of(
                        "service", "MELODY-AI",
                        "port", 9063,
                        "originPolicy", "http://localhost only",
                        "cors", "WebMvcConfigurer + Spring Security CORS enabled",
                        "framePolicy", "SAMEORIGIN with localhost frame-ancestors",
                        "timestamp", Instant.now().toString()));
    }

    @GetMapping("/composition/status")
    public CompositionStatus compositionStatus() {
        return compositionService.currentStatus();
    }

    @GetMapping("/integrations")
    public List<IntegrationStatus> integrations() {
        return compositionService.integrations();
    }

    @GetMapping("/regressions")
    public List<RegressionScenario> regressions() {
        return regressionScenarioService.findAll();
    }
}
