package org.wmo.weathersim.model;

public record RegionStatus(
        String code,
        String name,
        int availability,
        int latencyMs,
        int activePods,
        String condition
) {
}

