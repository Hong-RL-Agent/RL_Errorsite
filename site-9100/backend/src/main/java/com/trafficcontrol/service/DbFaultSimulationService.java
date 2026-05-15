package com.trafficcontrol.service;

import com.trafficcontrol.model.DashboardSnapshot;
import com.trafficcontrol.model.DbEvent;
import com.trafficcontrol.model.DbMetric;
import com.trafficcontrol.model.IntersectionState;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Random;
import javax.sql.DataSource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DbFaultSimulationService {
    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;
    private final Random random = new Random();
    private final List<Connection> leakedConnections = new ArrayList<>();

    public DbFaultSimulationService(JdbcTemplate jdbcTemplate, DataSource dataSource) {
        this.jdbcTemplate = jdbcTemplate;
        this.dataSource = dataSource;
    }

    public DashboardSnapshot snapshot() {
        List<IntersectionState> intersections = jdbcTemplate.query(
                "select code, district, signal_phase, cycle_seconds, vehicle_queue from intersections order by id",
                (rs, rowNum) -> new IntersectionState(
                        rs.getString("code"),
                        rs.getString("district"),
                        rs.getString("signal_phase"),
                        rs.getInt("cycle_seconds"),
                        rs.getInt("vehicle_queue"),
                        72 + random.nextDouble() * 24,
                        0.18 + random.nextDouble() * 0.71));

        return new DashboardSnapshot(
                intersections,
                List.of(
                        metric("Lock Wait", 68 + random.nextInt(25), "%", "DEADLOCK_RISK"),
                        metric("Pool Free", Math.max(0, 8 - leakedConnections.size()), "conn", "LEAK_PRONE"),
                        metric("Cache Hit", 39 + random.nextInt(19), "%", "BUFFER_PRESSURE"),
                        metric("Dirty Page", 74 + random.nextInt(18), "%", "FLUSH_STORM"),
                        metric("Disk Used", 97 + random.nextDouble() * 2, "%", "TABLESPACE_FULL"),
                        metric("Dead Tuple", 810000 + random.nextInt(250000), "rows", "VACUUM_STALLED")),
                eventFeed(),
                List.of(74, 38, 92, 66, 83, 55, 47, 101, 62, 71, 88, 44),
                System.currentTimeMillis());
    }

    @Transactional
    public DbEvent provokeLockContention() {
        jdbcTemplate.update("update intersections set cycle_seconds = cycle_seconds + 1 where code = 'JCT-SEOUL-001'");
        jdbcTemplate.update("update intersections set cycle_seconds = cycle_seconds - 1 where code = 'JCT-SEOUL-014'");
        return event("CRITICAL", "LOCK-MANAGER", "교차로 상태 갱신 순서가 충돌하여 deadlock 재현 가능 구간에 진입했습니다.");
    }

    public DbEvent leakConnection() {
        try {
            Connection connection = dataSource.getConnection();
            leakedConnections.add(connection);
            return event("WARN", "HIKARI-POOL", "반환되지 않은 커넥션을 보관했습니다. pool_free=" + Math.max(0, 8 - leakedConnections.size()));
        } catch (SQLException exception) {
            return event("CRITICAL", "HIKARI-POOL", "커넥션 풀 고갈 상태가 감지되었습니다: " + exception.getMessage());
        }
    }

    public DbEvent runSlowPlan() {
        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from traffic_event_log where lower(intersection_code) like '%seoul%' and payload like '%telemetry%'",
                Integer.class);
        return event("WARN", "QUERY-PLANNER", "함수 기반 조건과 와일드카드 검색으로 인덱스 우회 scan_rows=" + count);
    }

    public DbEvent simulateMigrationFailure() {
        return event("ERROR", "SCHEMA-MIGRATION", "v2026.05.06__phase_plan_upgrade.sql 실패: signal_phase_enum 누락 및 down migration 부재");
    }

    private DbMetric metric(String label, double value, String unit, String status) {
        return new DbMetric(label, Math.round(value * 10.0) / 10.0, unit, status);
    }

    private List<DbEvent> eventFeed() {
        return List.of(
                event("INFO", "SIGNAL-PPO", "PPO agent pushed adaptive cycle plan to 4 intersections."),
                event("WARN", "LOG-TABLE", "traffic_event_log is unpartitioned; latest query scanned cold pages."),
                event("CRITICAL", "TABLESPACE", "write headroom below 3%; insert throttling is imminent."),
                event("WARN", "CACHE", "buffer cache hit ratio dropped below metro control SLO."),
                event("ERROR", "VACUUM-GC", "background cleanup stalled; dead tuples are accumulating."));
    }

    private DbEvent event(String severity, String source, String message) {
        String time = LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss", Locale.US));
        return new DbEvent(time, severity, source, message);
    }
}
