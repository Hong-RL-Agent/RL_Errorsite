package com.wastemgmt.platform.model;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public final class WasteModels {
    private WasteModels() {
    }

    public record FleetVehicle(
        String id,
        String driver,
        String zone,
        double lat,
        double lng,
        int fillCollected,
        int battery,
        String routeState
    ) {
    }

    public record ZoneLoad(
        String zone,
        String district,
        int fillPercent,
        int organic,
        int recyclable,
        int hazard,
        String status
    ) {
    }

    public record NetworkMetric(
        String layer,
        String status,
        int latencyMs,
        double lossRate,
        String faultPattern,
        String impact
    ) {
    }

    public record FaultEvent(
        String code,
        String severity,
        String title,
        String detail,
        Instant observedAt
    ) {
    }

    public record DashboardSnapshot(
        Instant timestamp,
        List<FleetVehicle> vehicles,
        List<ZoneLoad> zones,
        List<NetworkMetric> network,
        List<FaultEvent> faults,
        Map<String, Object> preflight
    ) {
    }
}
