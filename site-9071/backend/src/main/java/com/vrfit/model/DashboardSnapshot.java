package com.vrfit.model;

import java.time.Instant;
import java.util.List;

public record DashboardSnapshot(
        Instant generatedAt,
        String cluster,
        String port,
        FitnessTelemetry fitness,
        KernelTelemetry kernel,
        AiTelemetry ai,
        List<MotionJoint> skeleton,
        List<TimePoint> heartRateSeries,
        List<TimePoint> calorieSeries,
        List<ScenarioStatus> scenarios
) {
}
