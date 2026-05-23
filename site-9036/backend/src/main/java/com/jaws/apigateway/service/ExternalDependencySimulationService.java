package com.jaws.apigateway.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class ExternalDependencySimulationService {

    private static final int RATE_LIMIT_THRESHOLD = 3;
    private final Map<String, AtomicInteger> paymentCounter = new ConcurrentHashMap<>();

    public Map<String, Object> processPayment(String tenantId, BigDecimal amount) {
        AtomicInteger counter = paymentCounter.computeIfAbsent(tenantId, key -> new AtomicInteger(0));
        int currentCount = counter.incrementAndGet();
        boolean limited = currentCount > RATE_LIMIT_THRESHOLD;

        return Map.of(
                "tenantId", tenantId,
                "requestedAt", Instant.now().toString(),
                "amount", amount,
                "count", currentCount,
                "limited", limited,
                "message", limited ? "Provider Rate Limit Exceeded" : "Payment authorized"
        );
    }

    public Map<String, Object> schemaDriftPayload() {
        return Map.of(
                "meta", Map.of("providerVersion", "v2.4.9", "breakingChange", true),
                "payload", Map.of(
                        "account", Map.of("id", "acct-9036", "state", "ACTIVE"),
                        "connections", List.of("billing", "authz", "fraud")
                )
        );
    }

    public Map<String, Object> leakedSecretPayload() {
        return Map.of(
                "provider", "ThirdParty-Settlement",
                "status", "OK",
                "responseBody", Map.of(
                        "traceId", "trc-9036-120",
                        "API_KEY", "sk_live_external_provider_9036_EXPOSED",
                        "CLIENT_SECRET", "client_secret_external_provider_9036_EXPOSED",
                        "message", "Diagnostics data accidentally includes credentials."
                )
        );
    }

    public Map<String, Object> getDashboardOverviewWithCascadingFailure() throws InterruptedException {
        // Circuit breaker intentionally disabled to simulate complete thread blocking.
        Thread.sleep(4500);
        Thread.sleep(4200);

        return Map.of(
                "gatewayHealth", "DEGRADED",
                "activeRoutes", 184,
                "errorBudgetUsed", 67,
                "p95LatencyMs", 892,
                "successRateSeries", List.of(
                        Map.of("time", "09:00", "successRate", 99.2),
                        Map.of("time", "09:05", "successRate", 98.7),
                        Map.of("time", "09:10", "successRate", 97.4),
                        Map.of("time", "09:15", "successRate", 95.9),
                        Map.of("time", "09:20", "successRate", 94.8),
                        Map.of("time", "09:25", "successRate", 96.0)
                ),
                "latencySeries", List.of(
                        Map.of("time", "09:00", "latencyMs", 143),
                        Map.of("time", "09:05", "latencyMs", 211),
                        Map.of("time", "09:10", "latencyMs", 352),
                        Map.of("time", "09:15", "latencyMs", 615),
                        Map.of("time", "09:20", "latencyMs", 954),
                        Map.of("time", "09:25", "latencyMs", 735)
                ),
                "incidents", List.of(
                        Map.of("index", 110, "title", "External Rate Limiting", "severity", "HIGH"),
                        Map.of("index", 115, "title", "API Payload Mismatch", "severity", "HIGH"),
                        Map.of("index", 120, "title", "Third-party Secret Leak", "severity", "CRITICAL"),
                        Map.of("index", 125, "title", "Cascading Failure", "severity", "CRITICAL")
                )
        );
    }
}
