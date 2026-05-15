package global.climateai.service;

import java.time.Instant;
import java.util.List;

public record DashboardSnapshot(
    Instant generatedAt,
    ClimateSummary summary,
    List<HeatPoint> heatmap,
    List<EmissionSeries> emissions,
    List<NodeStatus> nodes,
    AutoscalingState autoscaling,
    List<SystemLog> logs,
    List<RegressionScenario> scenarios
) {}

record ClimateSummary(
    double globalTemperatureAnomaly,
    double oceanHeatIndex,
    double carbonPpm,
    double driftScore,
    int rejectedRequests,
    int lostLogEvents
) {}

record HeatPoint(
    double lat,
    double lon,
    double anomaly,
    String risk
) {}

record EmissionSeries(
    String sector,
    List<EmissionPoint> points
) {}

record EmissionPoint(
    String month,
    double value
) {}

record NodeStatus(
    String id,
    String region,
    double cpu,
    double memory,
    double queueDepth,
    String status,
    long cacheLagMs
) {}

record AutoscalingState(
    int desiredReplicas,
    int actualReplicas,
    int pendingReplicas,
    double trafficRps,
    double scaleLagSeconds,
    boolean commandFailure
) {}

record SystemLog(
    String time,
    String level,
    String source,
    String message,
    boolean forwarded
) {}

record RegressionScenario(
    int id,
    String name,
    String status,
    String signal,
    String trainingObjective
) {}

