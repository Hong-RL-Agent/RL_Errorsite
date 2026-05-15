package dev.codinggenie.api;

import dev.codinggenie.api.dto.AnalysisRequest;
import dev.codinggenie.api.dto.AnalysisResponse;
import dev.codinggenie.api.dto.MetricsResponse;
import dev.codinggenie.api.dto.SaveSnapshotRequest;
import dev.codinggenie.api.dto.SaveSnapshotResponse;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class GenieController {
    private final Random random = new Random();

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of(
            "status", "online",
            "service", "CODING-GENIE",
            "portContract", "http://localhost:9096",
            "timestamp", Instant.now().toString()
        );
    }

    @GetMapping("/metrics")
    public MetricsResponse metrics() {
        return new MetricsResponse(
            45 + random.nextInt(75),
            260 + random.nextInt(980),
            12 + random.nextInt(90),
            1000 + random.nextInt(18000),
            Instant.now().toString()
        );
    }

    @PostMapping("/analysis")
    public ResponseEntity<AnalysisResponse> analyze(@RequestBody AnalysisRequest request) throws InterruptedException {
        Thread.sleep(250L + random.nextInt(1100));
        String trace = UUID.randomUUID().toString();
        int severity = 40 + random.nextInt(60);
        List<String> findings = List.of(
            "Synchronous syntax scan blocks first paint in " + request.fileName(),
            "Detached editor nodes retained after diagnostic popup close",
            "Race-prone request accepted without sequence validation",
            "Large code viewport renders without virtualization"
        );

        AnalysisResponse body = new AnalysisResponse(
            trace,
            request.tabId(),
            request.fileName(),
            severity,
            findings,
            "NEON_STATIC_ANALYZER",
            Instant.now().toString()
        );

        return ResponseEntity.ok()
            .header("X-Genie-Trace", trace)
            .body(body);
    }

    @PostMapping("/snapshot")
    public SaveSnapshotResponse saveSnapshot(@RequestBody SaveSnapshotRequest request) throws InterruptedException {
        Thread.sleep(500L + random.nextInt(900));
        return new SaveSnapshotResponse(
            UUID.randomUUID().toString(),
            request.tabId(),
            request.lines(),
            "stored",
            Instant.now().toString()
        );
    }
}
