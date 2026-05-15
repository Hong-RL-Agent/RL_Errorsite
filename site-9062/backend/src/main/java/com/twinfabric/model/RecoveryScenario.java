package com.twinfabric.model;

public record RecoveryScenario(
        int id,
        String key,
        String title,
        String simulatedDefect,
        String status,
        int progress,
        String impact,
        String lastEvent
) {
}

