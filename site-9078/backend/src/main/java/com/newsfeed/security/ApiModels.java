package com.newsfeed.security;

import java.util.List;

public final class ApiModels {
    private ApiModels() {
    }

    public record NewsItem(
        String id,
        String title,
        String section,
        String source,
        String priority,
        String summary,
        int trustScore,
        String timestamp,
        List<String> signals
    ) {
    }

    public record PreferenceMetric(String label, int value, String color) {
    }

    public record InventoryItem(
        String component,
        String type,
        String version,
        String owner,
        String risk,
        String finding
    ) {
    }

    public record RouteHop(
        String name,
        String kind,
        String region,
        int latencyMs,
        String state
    ) {
    }

    public record NetworkTrace(String id, String routeName, String status, List<RouteHop> hops) {
    }

    public record IncidentPattern(
        int id,
        String name,
        String severity,
        String surface,
        String indicator,
        String simulationLog
    ) {
    }

    public record DashboardPayload(
        List<NewsItem> news,
        List<PreferenceMetric> preferences,
        List<InventoryItem> inventory,
        List<NetworkTrace> traces,
        List<IncidentPattern> incidents
    ) {
    }
}
