package com.healthpill.controller;

import com.healthpill.model.DeploymentStatus;
import com.healthpill.model.HeartbeatSample;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.IntStream;

@RestController
@RequestMapping("/api")
public class HealthPillController {
    @GetMapping("/vitals/stream")
    public Map<String, Object> vitals() {
        var now = Instant.now();
        List<HeartbeatSample> samples = IntStream.range(0, 36)
                .mapToObj(i -> new HeartbeatSample(
                        now.minusSeconds((35L - i) * 2L),
                        72 + (int) Math.round(Math.sin(i / 2.0) * 9) + ThreadLocalRandom.current().nextInt(-2, 3),
                        97 + ThreadLocalRandom.current().nextInt(0, 3),
                        42 + ThreadLocalRandom.current().nextInt(-8, 9),
                        i > 28 ? "live" : "sampled"))
                .toList();
        return Map.of(
                "device", "HP-Watch Pro",
                "patient", "Global Care Member",
                "samples", samples,
                "serverClock", now.toString()
        );
    }

    @GetMapping("/deployments/status")
    public Map<String, Object> deployments() {
        return Map.of(
                "bigBang", new DeploymentStatus(
                        "Big Bang",
                        "v2.8.0",
                        "v2.9.0",
                        0.124,
                        "critical",
                        "rollback artifact was overwritten after promotion"),
                "canary", new DeploymentStatus(
                        "Canary",
                        "v2.8.0",
                        "v2.9.1-canary",
                        0.018,
                        "warning",
                        "false-positive error window blocks healthy rollout"),
                "blueGreen", new DeploymentStatus(
                        "Blue/Green",
                        "blue:v2.8.0",
                        "green:v2.9.0",
                        0.041,
                        "warning",
                        "medication_schedule column shape differs between pools")
        );
    }

    @GetMapping("/client/performance")
    public Map<String, Object> clientPerformance() {
        return Map.of(
                "domNodes", 18420,
                "memoryMb", 512,
                "storagePressure", 0.93,
                "indexedDbLocks", 7,
                "workerMessagesPerSecond", 2300,
                "lazyImageFailures", 11
        );
    }
}
