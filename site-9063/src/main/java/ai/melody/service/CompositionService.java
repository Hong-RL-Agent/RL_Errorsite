package ai.melody.service;

import ai.melody.model.CompositionStatus;
import ai.melody.model.IntegrationStatus;
import java.time.Instant;
import java.util.List;
import java.util.stream.IntStream;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class CompositionService {
    private final String frontendOrigin;
    private final String backendOrigin;

    public CompositionService(
            @Value("${melody-ai.frontend-origin}") String frontendOrigin,
            @Value("${melody-ai.backend-origin}") String backendOrigin) {
        this.frontendOrigin = frontendOrigin;
        this.backendOrigin = backendOrigin;
    }

    public CompositionStatus currentStatus() {
        List<Double> waveform = IntStream.range(0, 96)
                .mapToDouble(i -> {
                    double carrier = Math.sin(i * 0.34) * 0.62;
                    double transientLayer = Math.sin(i * 1.13) * 0.24;
                    double automation = Math.cos(i * 0.08) * 0.14;
                    return Math.round((carrier + transientLayer + automation) * 1000.0) / 1000.0;
                })
                .boxed()
                .toList();

        return new CompositionStatus(
                "MELODY-9063-A7",
                "cinematic synthwave",
                126,
                "F# minor",
                73,
                List.of(
                        "Kick bus sidechain locked",
                        "AI motif generator rendering bar 33-48",
                        "Harmony guardrail checking modal interchange",
                        "Stem exporter waiting for checksum gate"),
                waveform,
                Instant.now());
    }

    public List<IntegrationStatus> integrations() {
        return List.of(
                new IntegrationStatus("Vite Proxy", frontendOrigin + " -> /api -> " + backendOrigin, "ONLINE", 11,
                        "localhost origin path normalized"),
                new IntegrationStatus("Model Runtime", backendOrigin + "/api/composition/status", "DEGRADED", 48,
                        "accelerator fallback guard active"),
                new IntegrationStatus("External Auth Bridge", "http://localhost/oauth/callback", "WATCH", 72,
                        "state nonce and context vault enabled"),
                new IntegrationStatus("Stem Storage", "http://localhost/signed-assets", "ONLINE", 24,
                        "checksum and expiry validation active"));
    }
}
