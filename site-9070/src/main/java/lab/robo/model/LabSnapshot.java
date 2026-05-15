package lab.robo.model;

import java.time.Instant;
import java.util.List;

public record LabSnapshot(
        Instant generatedAt,
        List<Telemetry> telemetry,
        List<Scenario> scenarios,
        List<ServiceTicket> tickets,
        List<LatencyHop> latencyChain,
        List<RobotJoint> robotJoints,
        PopupState popup,
        BadgeState badge
) {
    public record Telemetry(String key, String label, double value, String unit, double limit, String state) {}

    public record Scenario(int id, String title, String defectClass, String signal, double intensity, String state) {}

    public record ServiceTicket(String id, String robotCell, String title, String severity, String status, int ageMinutes, boolean autoClosed) {}

    public record LatencyHop(String service, int p50Ms, int p95Ms, int p99Ms) {}

    public record RobotJoint(String name, double x, double y, double angleDeg, double loadPct) {}

    public record PopupState(String type, String title, String message, String pressureAction, int countdownSec) {}

    public record BadgeState(int visibleCount, int actualUnread, boolean fakeBadge) {}
}
