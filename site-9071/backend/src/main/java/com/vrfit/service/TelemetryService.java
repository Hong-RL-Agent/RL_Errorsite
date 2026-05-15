package com.vrfit.service;

import com.vrfit.model.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class TelemetryService {
    private static final DateTimeFormatter TICK = DateTimeFormatter.ofPattern("HH:mm:ss").withZone(ZoneOffset.UTC);

    public DashboardSnapshot snapshot() {
        ThreadLocalRandom random = ThreadLocalRandom.current();
        List<ScenarioStatus> scenarios = scenarios(random);
        double aggregateRisk = scenarios.stream().mapToDouble(ScenarioStatus::risk).average().orElse(0.0);

        return new DashboardSnapshot(
                Instant.now(),
                "vrfit-kernel-lab-9071",
                "9071",
                new FitnessTelemetry(
                        1842 + random.nextInt(0, 90),
                        142 + random.nextInt(-6, 9),
                        815 + random.nextInt(-38, 55),
                        clamp(98.2 - aggregateRisk * 14 + random.nextDouble(-0.6, 0.8), 0, 100),
                        clamp(91.0 - aggregateRisk * 18 + random.nextDouble(-2.0, 2.0), 0, 100),
                        clamp(aggregateRisk * 12 + random.nextDouble(0.2, 2.2), 0, 100)
                ),
                new KernelTelemetry(
                        clamp(4.5 + aggregateRisk * 37 + random.nextDouble(0, 5), 0, 100),
                        3200 + aggregateRisk * 28000 + random.nextDouble(-600, 900),
                        clamp(38 + aggregateRisk * 55 + random.nextDouble(-4, 5), 0, 100),
                        2.8 + aggregateRisk * 160 + random.nextDouble(0, 12),
                        412 + aggregateRisk * 8800 + random.nextDouble(0, 400),
                        (int) Math.round(aggregateRisk * 52 + random.nextInt(0, 7)),
                        aggregateRisk > 0.70 ? "critical contention" : aggregateRisk > 0.45 ? "degraded" : "nominal"
                ),
                new AiTelemetry(
                        21 + aggregateRisk * 145 + random.nextDouble(-4, 8),
                        4 + aggregateRisk * 38 + random.nextDouble(0, 4),
                        clamp(aggregateRisk * 31 + random.nextDouble(0, 4), 0, 100),
                        clamp(aggregateRisk * 27 + random.nextDouble(0, 6), 0, 100),
                        "KST edge + UTC core drift: +" + (int) Math.round(aggregateRisk * 740) + "ms",
                        clamp(96.5 - aggregateRisk * 19 + random.nextDouble(-1.1, 1.4), 0, 100)
                ),
                skeleton(random),
                series(random, 12, 128, 168),
                series(random, 12, 540, 940),
                scenarios
        );
    }

    public List<ScenarioStatus> scenarios() {
        return scenarios(ThreadLocalRandom.current());
    }

    private List<ScenarioStatus> scenarios(ThreadLocalRandom random) {
        return List.of(
                scenario(1, "OOM_RENDER_KILL", "OOM killer selected core render process", "kernel/mm", "critical", 0.84, 310, 2.1, "렌더링 워커가 메모리 점수 산정 오류로 종료됨", "termination_penalty", random),
                scenario(2, "KERNEL_HARD_LOCKUP", "Kernel hard lockup freezes motion loop", "kernel/scheduler", "critical", 0.79, 420, 5.4, "NMI watchdog 지연으로 프레임 제출이 멈춤", "freeze_latency_spike", random),
                scenario(3, "ZOMBIE_SESSION_LEAK", "Zombie resources from closed VR sessions", "session/memory", "high", 0.68, 95, 0.8, "종료 세션의 GPU 버퍼와 센서 큐가 해제되지 않음", "leak_accumulation", random),
                scenario(4, "NO_WARMUP_RECOVERY", "Cold server recovery performance cliff", "autoscaling", "high", 0.62, 180, 1.7, "복구 직후 모델 캐시와 JIT 워밍업 없이 트래픽 수용", "cold_start_cost", random),
                scenario(5, "QUOTA_GATE_BLOCK", "Quota exhaustion blocks new athletes", "infra/quota", "high", 0.57, 120, 8.9, "GPU namespace 할당량 초과 시 신규 접속 거부", "admission_rejection", random),
                scenario(6, "SILENT_CB_EMPTY", "Circuit breaker returns empty success", "resilience", "critical", 0.74, 34, 0.0, "실패를 빈 포즈 배열로 숨겨 사용자 화면이 정상처럼 보임", "false_success", random),
                scenario(7, "THREADLOCAL_BLEED", "ThreadLocal context leaks user identity", "runtime/security", "critical", 0.82, 88, 0.4, "스레드 재사용 중 이전 사용자 컨텍스트가 혼입됨", "privacy_cross_talk", random),
                scenario(8, "TZ_RECORD_DRIFT", "Timezone mismatch corrupts workout time", "time/records", "medium", 0.46, 42, 0.2, "KST/UTC 경계에서 운동 기록 시간이 어긋남", "temporal_inconsistency", random),
                scenario(9, "VMEXIT_STORM", "Excessive VM exits slow pose math", "virtualization", "high", 0.71, 260, 1.2, "가상화 인터럽트 폭증으로 SIMD 추론 루프가 지연됨", "compute_steal", random),
                scenario(10, "POSE_LATENCY_OVER", "AI pose latency exceeds motion budget", "ai/inference", "critical", 0.88, 520, 3.3, "포즈 추론이 임계치를 넘겨 동작 피드백이 뒤늦게 표시됨", "control_lag", random),
                scenario(11, "SENSOR_PIPELINE_DROP", "Sensor ingestion bottleneck drops frames", "streaming/io", "high", 0.69, 155, 11.6, "수집 파이프라인 백프레셔로 센서 샘플이 손실됨", "observation_loss", random)
        );
    }

    private ScenarioStatus scenario(int id, String code, String title, String subsystem, String severity, double baseRisk,
                                    double baseLatency, double baseLoss, String symptom, String ppoSignal, ThreadLocalRandom random) {
        double risk = clamp(baseRisk + random.nextDouble(-0.09, 0.07), 0, 1);
        return new ScenarioStatus(
                id,
                code,
                title,
                subsystem,
                severity,
                risk,
                Math.max(1, baseLatency + random.nextDouble(-24, 36)),
                clamp(baseLoss + random.nextDouble(-0.5, 1.4), 0, 100),
                symptom,
                ppoSignal,
                risk > 0.50
        );
    }

    private List<MotionJoint> skeleton(ThreadLocalRandom random) {
        return List.of(
                joint("head", 50, 13, 0.4, random),
                joint("neck", 50, 25, 0.3, random),
                joint("leftShoulder", 36, 31, 0.2, random),
                joint("rightShoulder", 64, 31, 0.2, random),
                joint("leftElbow", 25, 46, 0.1, random),
                joint("rightElbow", 75, 44, 0.1, random),
                joint("leftWrist", 18, 62, -0.1, random),
                joint("rightWrist", 82, 58, -0.1, random),
                joint("core", 50, 50, 0.1, random),
                joint("leftKnee", 39, 74, -0.2, random),
                joint("rightKnee", 61, 74, -0.2, random),
                joint("leftAnkle", 34, 91, -0.3, random),
                joint("rightAnkle", 66, 91, -0.3, random)
        );
    }

    private MotionJoint joint(String name, double x, double y, double z, ThreadLocalRandom random) {
        return new MotionJoint(
                name,
                clamp(x + random.nextDouble(-2.4, 2.4), 0, 100),
                clamp(y + random.nextDouble(-2.0, 2.0), 0, 100),
                z + random.nextDouble(-0.04, 0.04),
                clamp(96 + random.nextDouble(-7, 2), 0, 100)
        );
    }

    private List<TimePoint> series(ThreadLocalRandom random, int count, int min, int max) {
        Instant now = Instant.now();
        return java.util.stream.IntStream.range(0, count)
                .mapToObj(i -> {
                    double wave = Math.sin((i / (double) count) * Math.PI * 2) * (max - min) * 0.18;
                    double value = min + (max - min) * 0.55 + wave + random.nextDouble(-12, 12);
                    return new TimePoint(TICK.format(now.minusSeconds((long) (count - i) * 4)), clamp(value, min, max));
                })
                .toList();
    }

    private double clamp(double value, double min, double max) {
        return Math.max(min, Math.min(max, value));
    }
}
