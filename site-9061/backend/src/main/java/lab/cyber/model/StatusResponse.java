package lab.cyber.model;

import java.util.List;

public record StatusResponse(
        LabMetrics metrics,
        DefensePosture defense,
        List<ScenarioState> scenarios,
        List<LabLog> logs
) {
}
