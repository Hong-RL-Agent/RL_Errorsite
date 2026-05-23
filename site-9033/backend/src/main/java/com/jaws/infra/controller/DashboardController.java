package com.jaws.infra.controller;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DashboardController {

    @GetMapping("/api/v1/dashboard/metrics")
    public Map<String, Object> metrics() {
        return Map.of(
                "activeNodes", 12,
                "failedJobs", 7,
                "deploySuccessRate", 68.4,
                "incidentCount", 14,
                "lastUpdated", Instant.now().toString()
        );
    }

    @GetMapping("/api/v1/dashboard/pipeline-timeline")
    public List<Map<String, Object>> timeline() {
        return List.of(
                Map.of("stage", "Build", "latency", 21, "errors", 1),
                Map.of("stage", "Unit Test", "latency", 38, "errors", 2),
                Map.of("stage", "Security Scan", "latency", 57, "errors", 3),
                Map.of("stage", "Deploy", "latency", 26, "errors", 4),
                Map.of("stage", "Post Deploy", "latency", 18, "errors", 2)
        );
    }
}
