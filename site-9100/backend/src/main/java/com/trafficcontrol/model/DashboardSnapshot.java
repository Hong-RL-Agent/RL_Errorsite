package com.trafficcontrol.model;

import java.util.List;

public record DashboardSnapshot(
        List<IntersectionState> intersections,
        List<DbMetric> dbMetrics,
        List<DbEvent> events,
        List<Integer> signalCycles,
        long generatedAt) {
}
