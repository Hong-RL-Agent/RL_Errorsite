package lab.skylogistics.model;

import java.time.Instant;

public record RegressionEvent(
        String id,
        String title,
        String severity,
        String status,
        String symptom,
        String systemLog,
        long impactMs,
        Instant lastTriggered
) {
    public RegressionEvent triggered(String status, long impactMs, String systemLog) {
        return new RegressionEvent(id, title, severity, status, symptom, systemLog, impactMs, Instant.now());
    }

    public RegressionEvent reset() {
        return new RegressionEvent(id, title, severity, "standby", symptom, systemLog, 0, null);
    }
}
