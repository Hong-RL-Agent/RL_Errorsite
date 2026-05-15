package com.vrfit.model;

public record KernelTelemetry(
        double cpuSteal,
        double vmExitRate,
        double memoryPressure,
        double schedulerDelayMs,
        double zombieSessionMb,
        int quotaBlockedSessions,
        String state
) {
}
