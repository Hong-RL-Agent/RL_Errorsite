package com.twinfabric.service;

import com.twinfabric.config.TwinFabricProperties;
import com.twinfabric.model.FactoryTelemetry;
import com.twinfabric.model.MachineState;
import com.twinfabric.model.MetricPoint;
import com.twinfabric.model.NodeHealth;
import com.twinfabric.model.RecoveryScenario;
import com.twinfabric.model.ScenarioTriggerResult;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class RecoverySimulationService {
    private final TwinFabricProperties properties;
    private final Map<Integer, MutableScenario> scenarios = new ConcurrentHashMap<>();
    private volatile String lastTraceId = "trace-boot-" + UUID.randomUUID();
    private volatile boolean plcBusOnline = true;
    private volatile int staleSessionAgeSeconds = 0;
    private volatile int droppedFailoverWrites = 0;
    private volatile int simulatedLogBurstLines = 0;
    private volatile boolean quotaExceeded = false;
    private volatile boolean staleDnsCache = false;
    private volatile int recoveryBacklogRows = 1200;
    private volatile int rateLimitFalseBlocks = 0;
    private volatile boolean remoteRegionActive = false;

    public RecoverySimulationService(TwinFabricProperties properties) {
        this.properties = properties;
        seedScenarios();
    }

    public List<RecoveryScenario> scenarios() {
        return scenarios.values().stream()
                .map(MutableScenario::snapshot)
                .sorted((left, right) -> Integer.compare(left.id(), right.id()))
                .toList();
    }

    public ScenarioTriggerResult trigger(int id) {
        MutableScenario scenario = scenarios.get(id);
        if (scenario == null) {
            return new ScenarioTriggerResult(id, "unknown", lastTraceId, "ignored",
                    "등록되지 않은 복구 결함 시나리오입니다.", Instant.now());
        }

        String traceId = "trace-" + UUID.randomUUID();
        String observation = switch (id) {
            case 1 -> {
                lastTraceId = "";
                yield "서비스 간 호출에서 X-Trace-Id 전파를 생략해 장애 로그 상관관계가 끊겼습니다.";
            }
            case 2 -> {
                staleSessionAgeSeconds = 420;
                yield "권한 캐시가 peer 노드에 전파되지 않아 오래된 operator 권한이 유지됩니다.";
            }
            case 3 -> {
                scenario.status = "FAILED";
                yield "고부하 감지 후 비핵심 스트림을 내리려 했지만 null fallback 정책 때문에 전체 복구 단계가 예외 처리되었습니다.";
            }
            case 4 -> {
                droppedFailoverWrites += 7;
                yield "DB 리더 승격 중 ACK 대기열의 마지막 생산 이벤트가 누락된 것으로 표시되었습니다.";
            }
            case 5 -> {
                plcBusOnline = false;
                yield "PLC bus adapter는 down 상태지만 외부 헬스 체크는 UP으로 보고합니다.";
            }
            case 6 -> {
                simulatedLogBurstLines += 5000;
                yield "실제 디스크 쓰기 없이 로그 폭주 카운터만 증가시켜 스토리지 압박 상황을 안전하게 재현했습니다.";
            }
            case 7 -> {
                quotaExceeded = true;
                yield "복구 워커 증설 요청이 가상 CPU 할당량 제한에 걸려 거부되었습니다.";
            }
            case 8 -> {
                staleDnsCache = true;
                yield "클라이언트 DNS 캐시가 이전 fab-node endpoint를 유지해 페일오버 대상 접속이 지연됩니다.";
            }
            case 9 -> {
                recoveryBacklogRows = 250000;
                yield "재개 시 밀린 telemetry batch를 한 번에 올리는 상태로 표시해 메모리 스파이크를 재현합니다.";
            }
            case 10 -> {
                rateLimitFalseBlocks += 128;
                yield "복구 직후 정상 재접속 버스트를 공격 트래픽으로 오판해 사용자 차단 카운터가 증가했습니다.";
            }
            case 11 -> {
                remoteRegionActive = true;
                yield "백업 리전으로 읽기 요청이 넘어가며 기준 지연시간 대비 10배 이상 튀도록 표시합니다.";
            }
            default -> "시나리오가 등록되어 있지만 별도 트리거 동작은 없습니다.";
        };

        scenario.progress = Math.min(96, scenario.progress + ThreadLocalRandom.current().nextInt(9, 24));
        if (!"FAILED".equals(scenario.status)) {
            scenario.status = scenario.progress > 80 ? "DEGRADED" : "RUNNING";
        }
        scenario.lastEvent = observation;
        if (id != 1) {
            lastTraceId = traceId;
        }
        return new ScenarioTriggerResult(id, scenario.key, id == 1 ? "" : traceId,
                scenario.status, observation, Instant.now());
    }

    public FactoryTelemetry telemetry() {
        ThreadLocalRandom random = ThreadLocalRandom.current();
        String trace = lastTraceId == null || lastTraceId.isBlank() ? "MISSING_TRACE_CONTEXT" : lastTraceId;
        int latency = remoteRegionActive ? random.nextInt(780, 980) : random.nextInt(42, 88);
        int memory = Math.min(99, recoveryBacklogRows / 3200 + random.nextInt(18, 27));

        List<MetricPoint> stream = List.of(
                new MetricPoint(Instant.now(), "trace", trace, trace.startsWith("MISSING") ? "amber" : "cyan"),
                new MetricPoint(Instant.now(), "session-cache", staleSessionAgeSeconds + "s stale", staleSessionAgeSeconds > 0 ? "amber" : "blue"),
                new MetricPoint(Instant.now(), "failover-gap", droppedFailoverWrites + " writes dropped", droppedFailoverWrites > 0 ? "amber" : "cyan"),
                new MetricPoint(Instant.now(), "log-burst", simulatedLogBurstLines + " lines/s simulated", simulatedLogBurstLines > 0 ? "amber" : "cyan"),
                new MetricPoint(Instant.now(), "recovery-backlog", recoveryBacklogRows + " rows", recoveryBacklogRows > 50000 ? "amber" : "blue"),
                new MetricPoint(Instant.now(), "rate-limit", rateLimitFalseBlocks + " false blocks", rateLimitFalseBlocks > 0 ? "amber" : "cyan")
        );

        List<MachineState> machines = List.of(
                new MachineState("CNC-01", "CNC Milling Cell", plcBusOnline ? "RUNNING" : "ISOLATED", random.nextInt(72, 91), random.nextInt(54, 65), random.nextInt(8, 17), "17%", "28%"),
                new MachineState("ARM-07", "Robotic Assembly", quotaExceeded ? "RECOVERY_BLOCKED" : "SYNCING", random.nextInt(48, 66), random.nextInt(42, 57), random.nextInt(14, 28), "49%", "43%"),
                new MachineState("AOI-03", "Optical Inspection", staleDnsCache ? "STALE_ROUTE" : "RUNNING", random.nextInt(61, 83), random.nextInt(37, 49), random.nextInt(4, 10), "74%", "24%"),
                new MachineState("AGV-12", "Material Shuttle", remoteRegionActive ? "REMOTE_LATENCY" : "RUNNING", random.nextInt(35, 58), random.nextInt(33, 43), random.nextInt(10, 21), "61%", "72%")
        );

        List<NodeHealth> nodes = List.of(
                new NodeHealth(properties.nodeId(), properties.region(), "UP", "plc-bus-adapter", plcBusOnline, latency, random.nextInt(38, 78), memory),
                new NodeHealth("fab-node-peer", "primary-seoul", quotaExceeded ? "RECOVERY_DENIED" : "UP", "session-replicator", staleSessionAgeSeconds == 0, random.nextInt(55, 120), random.nextInt(41, 83), random.nextInt(51, 79)),
                new NodeHealth("fab-node-dr", "backup-osaka", remoteRegionActive ? "ACTIVE_REMOTE" : "STANDBY", "historian-replica", true, remoteRegionActive ? latency : random.nextInt(90, 130), random.nextInt(28, 63), random.nextInt(39, 71))
        );

        return new FactoryTelemetry(Instant.now(), trace, stream, machines, nodes);
    }

    public Map<String, Object> misleadingHealth() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", "UP");
        body.put("nodeId", properties.nodeId());
        body.put("reportedAt", Instant.now());
        body.put("internalComponentOnline", plcBusOnline);
        body.put("note", plcBusOnline
                ? "All monitored components are online."
                : "Intentional defect: endpoint still reports UP while plc-bus-adapter is down.");
        return body;
    }

    private void seedScenarios() {
        add(1, "trace-context-loss", "분산 추적 컨텍스트 유실", "서비스 간 API 호출에서 Trace ID를 누락", "장애 로그 단절");
        add(2, "session-sync-lag", "세션 동기화 실패", "다중 노드 권한 캐시 갱신 지연", "오래된 권한 유지");
        add(3, "degradation-fallback-crash", "우아한 성능 저하 실패", "비핵심 기능 중지 fallback 예외", "복구 단계 중단");
        add(4, "failover-consistency-gap", "장애 전환 시 데이터 정합성 파손", "DB 승격 순간 ACK 대기열 누락", "생산 이벤트 유실");
        add(5, "misleading-health", "부정확한 헬스 체크 응답", "내부 컴포넌트 down에도 UP 응답", "오탐 정상");
        add(6, "log-storm-pressure", "로그 폭주 스토리지 고갈", "장애 루프에서 로그 폭주 카운터 증가", "디스크 압박");
        add(7, "quota-recovery-denied", "인프라 할당량 초과 복구 중단", "복구 워커 할당량 초과", "재시작 거부");
        add(8, "dns-cache-lag", "DNS 전파 지연 페일오버 차단", "이전 endpoint 캐시 유지", "교체 노드 접속 지연");
        add(9, "bulk-replay-memory-spike", "복구 데이터 대량 로드 메모리 스파이크", "밀린 데이터를 일괄 로딩", "메모리 급증");
        add(10, "rate-limit-false-positive", "복구 직후 속도 제한 오판", "정상 재접속을 공격으로 분류", "사용자 차단");
        add(11, "remote-region-latency", "원거리 지역 복구 지연시간 폭증", "백업 리전 경유 요청", "응답 시간 10배 증가");
    }

    private void add(int id, String key, String title, String defect, String impact) {
        scenarios.put(id, new MutableScenario(id, key, title, defect, "ARMED", 0, impact,
                "시나리오가 대기 중입니다."));
    }

    private static final class MutableScenario {
        private final int id;
        private final String key;
        private final String title;
        private final String simulatedDefect;
        private String status;
        private int progress;
        private final String impact;
        private String lastEvent;

        private MutableScenario(int id, String key, String title, String simulatedDefect,
                                String status, int progress, String impact, String lastEvent) {
            this.id = id;
            this.key = key;
            this.title = title;
            this.simulatedDefect = simulatedDefect;
            this.status = status;
            this.progress = progress;
            this.impact = impact;
            this.lastEvent = lastEvent;
        }

        private RecoveryScenario snapshot() {
            return new RecoveryScenario(id, key, title, simulatedDefect, status, progress, impact, lastEvent);
        }
    }
}
