package com.cyberpredict.model;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public final class DashboardModels {
    private DashboardModels() {
    }

    public record ThreatPoint(String id, String city, String country, double lat, double lng, String type,
                              int risk, String actor, String signal) {
    }

    public record CrimePrediction(String type, int predictedIncidents, double confidence, String trend) {
    }

    public record AuthRecord(String userId, String ip, String result, String method, String device,
                             Instant timestamp) {
    }

    public record SecurityEvent(String eventId, String severity, String source, String message, Instant timestamp) {
    }

    public record DashboardSnapshot(List<ThreatPoint> threatMap,
                                    List<CrimePrediction> predictions,
                                    List<AuthRecord> authRecords,
                                    List<SecurityEvent> securityEvents,
                                    Map<String, Object> system) {
    }
}
