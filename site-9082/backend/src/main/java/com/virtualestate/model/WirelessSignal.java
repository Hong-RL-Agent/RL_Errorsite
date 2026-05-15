package com.virtualestate.model;

public record WirelessSignal(
        String id,
        String protocol,
        String label,
        int strength,
        String band,
        String posture,
        String anomaly
) {
}
