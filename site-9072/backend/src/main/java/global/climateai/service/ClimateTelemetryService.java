package global.climateai.service;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.stereotype.Service;

@Service
public class ClimateTelemetryService {
    private static final DateTimeFormatter LOG_TIME =
        DateTimeFormatter.ofPattern("HH:mm:ss 'UTC'", Locale.US).withZone(ZoneOffset.UTC);

    public DashboardSnapshot snapshot() {
        ThreadLocalRandom random = ThreadLocalRandom.current();
        double driftScore = round(0.74 + random.nextDouble(0.1));
        int lostEvents = 140 + random.nextInt(70);
        int rejected = 310 + random.nextInt(120);

        return new DashboardSnapshot(
            Instant.now(),
            new ClimateSummary(
                round(1.42 + random.nextDouble(0.08)),
                round(92.5 + random.nextDouble(4.8)),
                round(424.1 + random.nextDouble(1.6)),
                driftScore,
                rejected,
                lostEvents
            ),
            heatmap(random),
            emissions(random),
            nodes(random),
            new AutoscalingState(18, 11, 7, round(18420 + random.nextDouble(1300)), round(182 + random.nextDouble(38)), true),
            logs(random),
            scenarios()
        );
    }

    private List<HeatPoint> heatmap(ThreadLocalRandom random) {
        List<HeatPoint> points = new ArrayList<>();
        for (int lat = -60; lat <= 75; lat += 15) {
            for (int lon = -150; lon <= 180; lon += 30) {
                double polarBoost = Math.abs(lat) > 45 ? 0.45 : 0.1;
                double anomaly = round(0.8 + polarBoost + random.nextDouble(1.6));
                String risk = anomaly > 2.25 ? "critical" : anomaly > 1.65 ? "elevated" : "watch";
                points.add(new HeatPoint(lat, lon, anomaly, risk));
            }
        }
        return points;
    }

    private List<EmissionSeries> emissions(ThreadLocalRandom random) {
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"};
        return List.of(
            series("Power", months, 34.0, 1.7, random),
            series("Transport", months, 25.5, 1.1, random),
            series("Industry", months, 29.0, 1.4, random)
        );
    }

    private EmissionSeries series(String sector, String[] months, double start, double slope, ThreadLocalRandom random) {
        List<EmissionPoint> points = new ArrayList<>();
        for (int i = 0; i < months.length; i++) {
            points.add(new EmissionPoint(months[i], round(start + (i * slope) + random.nextDouble(1.8))));
        }
        return new EmissionSeries(sector, points);
    }

    private List<NodeStatus> nodes(ThreadLocalRandom random) {
        return List.of(
            node("ai-core-01", "ap-northeast-2", 91, 84, 0.88, "saturated", 6200),
            node("ai-core-02", "us-west-2", 73, 69, 0.57, "serving", 3100),
            node("edge-ocean-07", "eu-central-1", 96, 91, 0.94, "queue_exhausted", 8500),
            node("ingest-atlas-03", "sa-east-1", 81, 77, 0.71, "log_collector_down", 4700),
            node("cache-sync-04", "ap-southeast-1", 68, 62, 0.43, "stale_cache", 12100)
        );
    }

    private NodeStatus node(String id, String region, double cpu, double memory, double queueDepth, String status, long cacheLagMs) {
        return new NodeStatus(id, region, cpu, memory, queueDepth, status, cacheLagMs);
    }

    private List<SystemLog> logs(ThreadLocalRandom random) {
        Instant now = Instant.now();
        return List.of(
            log(now.minusSeconds(4), "WARN", "drift-monitor", "Model drift score exceeded 0.74 but notification sink is disabled", false),
            log(now.minusSeconds(9), "ERROR", "autoscaler", "Scale command rejected: threshold lock expired before quorum", true),
            log(now.minusSeconds(14), "WARN", "traffic-gateway", "Surge window opened at " + (18200 + random.nextInt(400)) + " rps", true),
            log(now.minusSeconds(21), "ERROR", "queue-worker", "Burst queue exhausted; rejecting climate inference requests", true),
            log(now.minusSeconds(29), "INFO", "external-api", "Retry attempt issued without backoff metadata", false),
            log(now.minusSeconds(36), "WARN", "shutdown-hook", "SIGTERM received; active jobs interrupted immediately", true)
        );
    }

    private SystemLog log(Instant time, String level, String source, String message, boolean forwarded) {
        return new SystemLog(LOG_TIME.format(time), level, source, message, forwarded);
    }

    private List<RegressionScenario> scenarios() {
        return List.of(
            scenario(1, "Data drift alert sink disabled", "active", "drift_score_high_without_page", "Detect alerting paths that fail open during climate model drift."),
            scenario(2, "Incomplete error log filtering", "active", "missing_forwarded_error_events", "Penalize observability gaps caused by selective error omission."),
            scenario(3, "Autoscaling slower than traffic growth", "active", "replica_gap_with_rps_surge", "Learn that delayed scaling amplifies saturation."),
            scenario(4, "Scale command failure at resource threshold", "active", "threshold_reached_command_failed", "Correlate resource ceilings with failed control-plane commands."),
            scenario(5, "Abnormal traffic surge", "active", "surge_window_rps_spike", "Identify nonlinear traffic growth before SLO burn accelerates."),
            scenario(6, "Burst queue exhaustion", "active", "queue_depth_near_one_rejections", "Reduce rejection rate under transient burst traffic."),
            scenario(7, "Central log collector outage", "active", "forwarded_false_lost_events", "Treat telemetry transport failure as data loss risk."),
            scenario(8, "Distributed cache synchronization lag", "active", "cache_lag_ms_high", "Detect stale climate inference data across regions."),
            scenario(9, "External API missing timeout", "active", "thread_hang_risk", "Avoid unbounded waits on external climate feeds."),
            scenario(10, "Retry storm without exponential backoff", "active", "retry_without_jitter", "Suppress retry amplification under upstream faults."),
            scenario(11, "Graceful shutdown failure", "active", "jobs_interrupted_on_sigterm", "Require drain windows before process termination.")
        );
    }

    private RegressionScenario scenario(int id, String name, String status, String signal, String trainingObjective) {
        return new RegressionScenario(id, name, status, signal, trainingObjective);
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}

