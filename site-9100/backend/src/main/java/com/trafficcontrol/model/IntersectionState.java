package com.trafficcontrol.model;

public record IntersectionState(
        String code,
        String district,
        String phase,
        int cycleSeconds,
        int queue,
        double flowRate,
        double delayIndex) {
}
