package org.wmo.weathersim.service;

import org.springframework.stereotype.Service;
import org.wmo.weathersim.model.FaultScenario;
import org.wmo.weathersim.model.RegionStatus;
import org.wmo.weathersim.model.TelemetryPoint;
import org.wmo.weathersim.model.WeatherOverview;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class WeatherOpsService {
    public WeatherOverview overview() {
        return new WeatherOverview(
                Instant.now(),
                "http://localhost:9099",
                regions(),
                telemetry(),
                faults(),
                operationsLog()
        );
    }

    public List<RegionStatus> regions() {
        ThreadLocalRandom r = ThreadLocalRandom.current();
        return List.of(
                new RegionStatus("NA", "North America Radar Mesh", 99, r.nextInt(38, 72), 184, "Clear"),
                new RegionStatus("EU", "Europe Forecast Cluster", 97, r.nextInt(55, 96), 141, "Index pressure"),
                new RegionStatus("AP", "Asia-Pacific Typhoon Grid", 72, r.nextInt(180, 360), 88, "Regional failover"),
                new RegionStatus("SA", "South America Rainfall Net", 94, r.nextInt(82, 140), 73, "PV retry"),
                new RegionStatus("AF", "Africa Heatwave Sensors", 91, r.nextInt(110, 210), 62, "I/O throttled"),
                new RegionStatus("OC", "Oceania Ocean Buoys", 96, r.nextInt(70, 125), 54, "Replica lag")
        );
    }

    public List<TelemetryPoint> telemetry() {
        ThreadLocalRandom r = ThreadLocalRandom.current();
        return List.of(
                new TelemetryPoint("DB Replication Lag", r.nextInt(620, 860) + "s", "critical", "Replica apply queue saturated"),
                new TelemetryPoint("Missing Index Scan", r.nextLong(18_000_000, 28_000_000) + " rows", "critical", "weather_observations full table scan"),
                new TelemetryPoint("Disk I/O Credits", r.nextInt(0, 8) + "%", "warning", "Radar tile writes are throttled"),
                new TelemetryPoint("Monitoring Overhead", r.nextInt(21, 36) + "% CPU", "warning", "Telemetry sidecar sampling too aggressively"),
                new TelemetryPoint("Backup Integrity", "checksum failed", "critical", "Latest restore point is quarantined"),
                new TelemetryPoint("Transaction Isolation", "read committed drift", "warning", "Forecast snapshot versions diverged")
        );
    }

    public List<FaultScenario> faults() {
        return List.of(
                new FaultScenario("OOMKILLED", "Pod OOMKilled", "Kubernetes", "critical", "Assimilation pod exceeds memory limit", "memory RSS, restart count", "Raise limit, inspect heap, split batch window"),
                new FaultScenario("PV_MOUNT_ERROR", "PV mount failure", "Storage", "critical", "Radar archive volume cannot attach", "mount events, pending pods", "Fail over storage class and remount read replica"),
                new FaultScenario("REGION_OUTAGE", "Cloud region outage", "Cloud", "critical", "Asia-Pacific control plane degraded", "regional availability, failover latency", "Shift traffic to NA/EU forecast clusters"),
                new FaultScenario("ELK_FORMAT_BREAK", "ELK pipeline collapse", "Logging", "warning", "Log field renamed and parser drops events", "ingestion rate, parse failures", "Deploy schema adapter and dual-write format"),
                new FaultScenario("BACKUP_CORRUPTION", "Corrupted backup", "Database", "critical", "Checksum mismatch blocks restore", "restore dry-run, RPO age", "Quarantine artifact and restore previous verified snapshot"),
                new FaultScenario("IAM_LOCKOUT", "IAM lockout", "Security", "critical", "Operator role loses control-plane rights", "access denied rate, policy drift", "Apply break-glass role and policy rollback"),
                new FaultScenario("IO_CREDIT_EXHAUSTION", "Disk I/O credit exhaustion", "Storage", "warning", "Burst credits depleted", "queue depth, write latency", "Move hot shard to provisioned IOPS volume"),
                new FaultScenario("AGENT_OVERHEAD", "Monitoring agent overhead", "Observability", "warning", "Agent CPU steals application cycles", "agent CPU share, p95 latency", "Lower scrape frequency and cap sidecar CPU"),
                new FaultScenario("FULL_TABLE_SCAN", "Missing index full scan", "Database", "critical", "Forecast query scans observation table", "scanned rows, DB CPU", "Add composite index and update query plan"),
                new FaultScenario("TX_ISOLATION_DRIFT", "Low isolation inconsistency", "Database", "warning", "Concurrent updates produce divergent snapshots", "version drift, anomaly count", "Use repeatable-read transaction boundary"),
                new FaultScenario("REPLICATION_LAG", "Replication lag", "Database", "critical", "Replica trails primary by several minutes", "lag seconds, stale read percent", "Throttle ingestion and promote healthy replica")
        );
    }

    public List<String> operationsLog() {
        return List.of(
                "09:09:01Z WMO-CLOUD accepted simulation window origin=http://localhost:9099",
                "09:09:04Z K8S warning pod=polar-vortex-assimilation state=OOMKilled restarts=7",
                "09:09:08Z STORAGE error pv=radar-archive-pv mount=failed endpoint=timeout",
                "09:09:13Z DB critical query=globalForecastJoin scan=full_table rows=24192034",
                "09:09:21Z IAM denied role=weather-operator action=eks:UpdateClusterConfig",
                "09:09:34Z REPLICA lag source=weather-primary target=weather-replica seconds=742",
                "09:09:55Z PPO observation vector updated faults=11 severityMix=6C/5W"
        );
    }
}

