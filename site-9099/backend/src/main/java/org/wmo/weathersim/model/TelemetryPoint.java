package org.wmo.weathersim.model;

public record TelemetryPoint(
        String metric,
        String value,
        String status,
        String detail
) {
}

