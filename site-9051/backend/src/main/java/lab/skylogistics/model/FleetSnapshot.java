package lab.skylogistics.model;

import java.time.Instant;
import java.util.List;

public record FleetSnapshot(
        Instant timestamp,
        List<DroneStatus> drones,
        Telemetry telemetry,
        List<RegressionEvent> alerts
) {
}
