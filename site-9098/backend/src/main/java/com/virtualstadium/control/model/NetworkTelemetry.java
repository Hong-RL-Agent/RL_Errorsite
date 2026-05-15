package com.virtualstadium.control.model;

import java.util.List;

public record NetworkTelemetry(
        String primaryRegion,
        int bgpRoutes,
        int blackholedRoutes,
        int mtu,
        int expectedMtu,
        int natPortsUsed,
        int natPortsTotal,
        double edgeCacheHitRatio,
        double bandwidthUtilization,
        List<RouteStatus> routes
) {
}
