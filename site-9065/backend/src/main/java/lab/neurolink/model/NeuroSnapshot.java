package lab.neurolink.model;

import java.time.Instant;
import java.util.List;

public record NeuroSnapshot(
        Instant capturedAt,
        String sessionId,
        double cognitiveLoad,
        double anomalyScore,
        List<EegChannel> eegChannels,
        double[][] heatmap,
        List<HardwareStatus> hardware,
        List<DefectScenario> scenarios,
        List<LogEntry> logs
) {
}

