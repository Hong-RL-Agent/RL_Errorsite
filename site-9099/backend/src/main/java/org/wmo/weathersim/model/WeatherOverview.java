package org.wmo.weathersim.model;

import java.time.Instant;
import java.util.List;

public record WeatherOverview(
        Instant timestamp,
        String origin,
        List<RegionStatus> regions,
        List<TelemetryPoint> telemetry,
        List<FaultScenario> faults,
        List<String> operationsLog
) {
}

