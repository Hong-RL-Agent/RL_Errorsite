package com.spacemining.dto;

import java.util.List;
import java.util.Map;

public record MiningDashboardResponse(
        List<Map<String, Object>> asteroids,
        List<Map<String, Object>> transactions,
        Map<String, Object> telemetry,
        List<String> logs,
        List<Map<String, Object>> vulnerabilities
) {
}
