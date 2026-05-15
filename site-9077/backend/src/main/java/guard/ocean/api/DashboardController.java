package guard.ocean.api;

import java.time.Instant;
import java.util.List;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class DashboardController {
    @GetMapping("/pollution-zones")
    @QueryMapping
    public List<PollutionZone> pollutionZones() {
        return List.of(
            new PollutionZone("Z-NEP-441", "North Pacific Gyre", 31.2, -145.1, "Microplastics", 186.4, "HIGH"),
            new PollutionZone("Z-SEA-082", "East China Sea", 28.4, 125.8, "Hydrocarbon", 94.2, "ELEVATED"),
            new PollutionZone("Z-ATL-219", "Gulf Stream", 36.7, -62.3, "Nitrate", 61.8, "WATCH"),
            new PollutionZone("Z-IND-704", "Bay of Bengal", 13.1, 87.4, "Heavy Metals", 142.6, "HIGH")
        );
    }

    @GetMapping("/api-telemetry")
    @QueryMapping
    public List<ApiTelemetry> apiTelemetry() {
        return List.of(
            new ApiTelemetry("GraphQL", "pollution-schema", "INTROSPECTION_ON", 42, 0.8),
            new ApiTelemetry("gRPC", "sensor-fusion", "REFLECTION_ON", 17, 0.2),
            new ApiTelemetry("REST", "alert-router", "DEGRADED", 128, 2.9),
            new ApiTelemetry("WebSocket", "live-vessel-stream", "OPEN_ORIGIN", 23, 0.4)
        );
    }

    @GetMapping("/security-events")
    @QueryMapping
    public List<SecurityEvent> securityEvents() {
        return List.of(
            new SecurityEvent("E-9001", "ocean-guard-prod-a", "kube-apiserver", "CRITICAL", "Public API endpoint accepted anonymous discovery request", Instant.now().toString()),
            new SecurityEvent("E-9002", "sensor-edge-east", "container-runtime", "HIGH", "Privileged sensor sidecar mounted host namespace", Instant.now().minusSeconds(87).toString()),
            new SecurityEvent("E-9003", "identity-blue", "saml-gateway", "HIGH", "SAML response accepted with weak signature marker", Instant.now().minusSeconds(211).toString()),
            new SecurityEvent("E-9004", "auth-coral", "oauth-callback", "MEDIUM", "OAuth callback completed without state replay check", Instant.now().minusSeconds(340).toString())
        );
    }

    public record PollutionZone(String id, String region, double latitude, double longitude, String pollutant, double concentrationPpm, String severity) {}
    public record ApiTelemetry(String protocol, String service, String status, int latencyMs, double errorRate) {}
    public record SecurityEvent(String id, String cluster, String source, String severity, String message, String timestamp) {}
}
