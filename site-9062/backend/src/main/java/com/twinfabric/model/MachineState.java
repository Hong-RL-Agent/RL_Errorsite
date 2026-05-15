package com.twinfabric.model;

public record MachineState(
        String id,
        String label,
        String status,
        int throughput,
        int temperature,
        int vibration,
        String x,
        String y
) {
}

