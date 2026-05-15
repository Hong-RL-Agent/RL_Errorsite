package com.deepsea.data.service;

import com.deepsea.data.model.TelemetryModels.AvailabilityLog;
import com.deepsea.data.model.TelemetryModels.CableTraffic;
import com.deepsea.data.model.TelemetryModels.CoolingMetric;
import com.deepsea.data.model.TelemetryModels.DashboardSnapshot;
import com.deepsea.data.model.TelemetryModels.FaultPattern;
import com.deepsea.data.model.TelemetryModels.QueueLag;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class AvailabilitySimulationService {
    private final AtomicLong pulse = new AtomicLong();
    private final CopyOnWriteArrayList<AvailabilityLog> logs = new CopyOnWriteArrayList<>();

    public AvailabilitySimulationService() {
        logs.addAll(seedLogs());
    }

    public DashboardSnapshot snapshot() {
        long tick = pulse.incrementAndGet();
        double wave = Math.sin(tick / 3.0);
        return new DashboardSnapshot(
                Instant.now(),
                round(99.45 - Math.abs(wave) * 0.62),
                round(42.8 + Math.cos(tick / 4.0) * 3.1),
                round(18.6 - Math.abs(wave) * 5.8),
                cables(tick),
                cooling(tick),
                queues(tick),
                faultPatterns(),
                latestLogs()
        );
    }

    public List<AvailabilityLog> latestLogs() {
        int from = Math.max(0, logs.size() - 32);
        return new ArrayList<>(logs.subList(from, logs.size()));
    }

    public List<FaultPattern> faultPatterns() {
        return List.of(
                new FaultPattern(1, "Circuit breaker stuck closed", "CRITICAL", "Downstream 5xx burst",
                        "Failure counter resets before open threshold and fallback path is never selected.",
                        "Detect hidden breaker misconfiguration during cascading API failures."),
                new FaultPattern(2, "Async queue lag saturation", "HIGH", "Kafka/RabbitMQ lag > 180k",
                        "Consumer throughput is intentionally lower than producer rate.",
                        "Learn producer-consumer imbalance and lag propagation."),
                new FaultPattern(3, "Swapping death spiral", "CRITICAL", "Major page fault surge",
                        "Memory pressure simulation reports disk swap thrash before OOM.",
                        "Correlate memory exhaustion with latency collapse."),
                new FaultPattern(4, "Retry storm", "HIGH", "Immediate retry fan-out",
                        "Transient network drops trigger retries without backoff or jitter.",
                        "Identify retry amplification after short packet loss."),
                new FaultPattern(5, "Missing timeout", "CRITICAL", "Thread occupancy plateau",
                        "Remote calls are modeled as blocking waits with no deadline.",
                        "Spot thread pool exhaustion caused by absent timeout budgets."),
                new FaultPattern(6, "Alert delivery backlog", "HIGH", "Mail/SMS queue loss",
                        "Emergency notification channel has lower throughput than event ingress.",
                        "Detect delayed or dropped alerts under incident load."),
                new FaultPattern(7, "Timezone drift", "MEDIUM", "KST/UTC offset mismatch",
                        "Command center compares local timestamps against UTC node heartbeats.",
                        "Find availability math distorted by incorrect timezone conversion."),
                new FaultPattern(8, "Abrupt shutdown", "HIGH", "In-flight tasks abandoned",
                        "Application is configured for immediate shutdown instead of graceful drain.",
                        "Recognize lost work and partial writes during termination."),
                new FaultPattern(9, "Static cache miss penalty", "MEDIUM", "Repeated asset fetch",
                        "Report includes a cache-control fault scenario while production assets are cached.",
                        "Compare bad cache headers against corrected static asset policy."),
                new FaultPattern(10, "Duplicate scheduler execution", "HIGH", "Overlapping jobs",
                        "Scheduler emits duplicate pulses without checking previous run completion.",
                        "Detect background job overlap and resource contention."),
                new FaultPattern(11, "Distributed lock split brain", "CRITICAL", "Dual ownership",
                        "Lock lease is modeled as local-only, allowing two nodes to claim authority.",
                        "Learn lock expiry, fencing token, and split-brain signals.")
        );
    }

    @Scheduled(fixedRate = 2500)
    public void emitAvailabilityPulseA() {
        appendSyntheticLog("scheduler-A");
    }

    @Scheduled(fixedRate = 2500)
    public void emitAvailabilityPulseB() {
        appendSyntheticLog("scheduler-B");
    }

    private List<CableTraffic> cables(long tick) {
        return List.of(
                cable("PACIFIC-RING-01", "Busan <-> Seattle", 148.2, tick, "SYNC"),
                cable("ARCTIC-DUSK-07", "Reykjavik <-> Svalbard", 92.7, tick + 2, "DEGRADED"),
                cable("ABYSSAL-LINE-13", "Guam <-> Sydney", 121.5, tick + 5, "SYNC"),
                cable("TRENCH-GRID-22", "Tokyo <-> Singapore", 176.4, tick + 9, "LOSSY")
        );
    }

    private CableTraffic cable(String route, String region, double base, long tick, String status) {
        double load = base + Math.sin(tick / 2.0) * 10.5;
        double loss = "LOSSY".equals(status) ? 2.8 + Math.abs(Math.cos(tick)) : Math.abs(Math.sin(tick)) * 0.18;
        double latency = 28 + Math.abs(Math.cos(tick / 3.0)) * ("DEGRADED".equals(status) ? 72 : 18);
        return new CableTraffic(route, region, round(load), round(loss), round(latency), status);
    }

    private List<CoolingMetric> cooling(long tick) {
        return List.of(
                new CoolingMetric("CRYO-VAULT-A", round(94 + Math.sin(tick) * 2), round(6.8), 4180, "NOMINAL"),
                new CoolingMetric("HEAT-EXCHANGER-B", round(81 - Math.abs(Math.cos(tick)) * 9), round(11.6), 5520, "WATCH"),
                new CoolingMetric("PUMP-RING-C", round(73 - Math.abs(Math.sin(tick / 2.0)) * 14), round(14.2), 6810, "RISK")
        );
    }

    private List<QueueLag> queues(long tick) {
        long burst = Math.abs((long) (Math.sin(tick / 2.0) * 62000));
        return List.of(
                new QueueLag("Kafka", "cable.telemetry.raw", 181000 + burst, 9400, 31100, "SATURATED"),
                new QueueLag("RabbitMQ", "incident.alert.sms", 24900 + burst / 5, 420, 2100, "LOSS-RISK"),
                new QueueLag("Kafka", "cooling.metrics.windowed", 11200 + burst / 9, 7300, 8800, "ELEVATED")
        );
    }

    private void appendSyntheticLog(String scheduler) {
        String[] levels = {"INFO", "WARN", "ERROR", "CRITICAL"};
        String[] subsystems = {"circuit-breaker", "queue-lag", "swap-monitor", "retry-gateway", "distributed-lock"};
        String[] messages = {
                "breaker remains closed while downstream error budget burns",
                "consumer rate below ingress; lag projection exceeds drain window",
                "major page faults rising; swap device latency contaminates request path",
                "transient packet loss created immediate retry burst without jitter",
                "dual lock ownership observed for abyssal-admin authority"
        };
        int index = ThreadLocalRandom.current().nextInt(messages.length);
        logs.add(new AvailabilityLog(Instant.now(), levels[Math.min(index, levels.length - 1)], subsystems[index],
                scheduler + " :: " + messages[index]));
        while (logs.size() > 80) {
            logs.remove(0);
        }
    }

    private List<AvailabilityLog> seedLogs() {
        Instant base = Instant.now().minus(2, ChronoUnit.MINUTES);
        return List.of(
                new AvailabilityLog(base, "INFO", "control-plane", "9095 isolated command bus online"),
                new AvailabilityLog(base.plusSeconds(12), "WARN", "timezone", timezoneFaultMessage()),
                new AvailabilityLog(base.plusSeconds(27), "ERROR", "timeout", "unbounded remote wait retained worker threads"),
                new AvailabilityLog(base.plusSeconds(41), "CRITICAL", "notification", "mail/sms alert lane exceeded delivery capacity")
        );
    }

    private String timezoneFaultMessage() {
        LocalDateTime commandCenter = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        LocalDateTime nodeUtc = LocalDateTime.now(ZoneId.of("UTC"));
        return "command center KST " + commandCenter.truncatedTo(ChronoUnit.SECONDS)
                + " compared directly with node UTC " + nodeUtc.truncatedTo(ChronoUnit.SECONDS);
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
