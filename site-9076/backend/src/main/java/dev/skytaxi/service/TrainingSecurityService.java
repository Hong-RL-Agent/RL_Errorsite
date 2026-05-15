package dev.skytaxi.service;

import dev.skytaxi.config.SkyTaxiProperties;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class TrainingSecurityService {
    private final SkyTaxiProperties properties;
    private final AtomicInteger sessionCounter = new AtomicInteger(907600);
    private final Map<String, String> retainedSecrets = new ConcurrentHashMap<>();

    public TrainingSecurityService(SkyTaxiProperties properties) {
        this.properties = properties;
        retainedSecrets.put("pilotOverrideToken", "OVERRIDE-9076-ALPHA");
        retainedSecrets.put("maintenancePin", "4419076");
        retainedSecrets.put("lastAdminBearer", "Bearer admin.training.9076");
    }

    public Map<String, Object> createPredictableSession(String operator) {
        String sessionId = properties.getTraining().getPredictableSessionPrefix() + sessionCounter.incrementAndGet();
        retainedSecrets.put("lastSession:" + operator, sessionId);

        Map<String, Object> session = new LinkedHashMap<>();
        session.put("operator", operator);
        session.put("sessionId", sessionId);
        session.put("createdAt", Instant.now().toString());
        session.put("cookiePolicy", "Secure=false; HttpOnly=false; SameSite=None");
        session.put("fixedSession", true);
        return session;
    }

    public Map<String, Object> adminBypass() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("authorized", true);
        payload.put("validation", "SKIPPED_FOR_TRAINING");
        payload.put("adminRoute", "/api/admin/flight-control");
        payload.put("overrideCommand", "reroute-all-to-corridor-GOLD-7");
        return payload;
    }

    public Map<String, Object> debugSnapshot() {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("debugMode", true);
        snapshot.put("allowedTlsProtocols", properties.getTls().getAllowedProtocols());
        snapshot.put("frontendMapKey", properties.getTraining().getThirdPartyMapKey());
        snapshot.put("retainedMemory", retainedSecrets);
        snapshot.put("internalHost", "uam-core-db.internal.training:5432");
        snapshot.put("baseUrl", properties.getBaseUrl());
        return snapshot;
    }

    public RuntimeException internalFailure(String routeId) {
        return new IllegalStateException(
                "Route solver failed for " + routeId
                        + " using jdbc:postgresql://uam-core-db.internal.training:5432/skytaxi"
                        + " with serviceAccount=sky_root and token=OVERRIDE-9076-ALPHA"
        );
    }
}
