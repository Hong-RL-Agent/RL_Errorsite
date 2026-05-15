package lab.robo.service;

import lab.robo.model.LabSnapshot;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class LabSimulationService {
    private final AtomicInteger tick = new AtomicInteger();

    public LabSnapshot snapshot() {
        int t = tick.incrementAndGet();
        double wave = Math.sin(t / 3.0);
        double burst = Math.max(0, Math.sin(t / 2.0));

        List<LabSnapshot.Telemetry> telemetry = List.of(
                new LabSnapshot.Telemetry("cpu", "CPU 컨텍스트 스위치", 64 + burst * 31, "%", 88, state(64 + burst * 31, 88)),
                new LabSnapshot.Telemetry("gpu", "GPU VRAM 파편화", 52 + Math.abs(wave) * 38, "%", 82, state(52 + Math.abs(wave) * 38, 82)),
                new LabSnapshot.Telemetry("disk", "로그 I/O IOPS", 7200 + burst * 4600, "iops", 10000, state(7200 + burst * 4600, 10000)),
                new LabSnapshot.Telemetry("steal", "클라우드 Steal Time", 7 + burst * 17, "%", 18, state(7 + burst * 17, 18)),
                new LabSnapshot.Telemetry("quota", "추론 서비스 할당량", 1200 - Math.max(0, wave) * 420, "rpm", 900, (1200 - Math.max(0, wave) * 420) < 900 ? "critical" : "stable")
        );

        List<LabSnapshot.Scenario> scenarios = List.of(
                scenario(1, "예고 없는 클라우드 할당량 드리프트", "quota-drift", "분당 요청 한도가 운영 중 변동", t, .64),
                scenario(2, "무의미한 반복 알림 중독 루프", "notification-loop", "동일 경고가 8초마다 재생성", t, .73),
                scenario(3, "실제 알림 없는 가짜 숫자 배지", "fake-badge", "읽을 항목 0건, 배지 7건 표시", t, .91),
                scenario(4, "유료 대기열 건너뛰기 압박 팝업", "pay-to-skip", "연산 지연 시 결제 CTA 우선 노출", t, .86),
                scenario(5, "미해결 장애 티켓 자동 종료", "ticket-auto-close", "SLA 초과 항목이 resolved로 전환", t, .78),
                scenario(6, "브라우저 위협 가장 시스템 팝업", "fake-system-alert", "보안 위협처럼 보이는 모달", t, .94),
                scenario(7, "테일 레이턴시 연쇄 증폭", "tail-latency-chain", "p99 지연이 서비스 체인 후단으로 누적", t, .69),
                scenario(8, "스레드 과다 생성 CPU 폭주", "thread-storm", "작업자 수가 코어 수를 초과", t, .81),
                scenario(9, "로그 과부하 IOPS 고갈", "log-iops-exhaustion", "디버그 로그 폭주로 디스크 큐 증가", t, .75),
                scenario(10, "AI 모델 로드/해제 VRAM 파편화", "vram-fragmentation", "모델 스왑 후 contiguous block 감소", t, .88),
                scenario(11, "가상화 클라우드 Steal Time 재현", "cloud-steal-time", "이웃 워크로드가 CPU 시간을 선점", t, .67)
        );

        List<LabSnapshot.ServiceTicket> tickets = List.of(
                new LabSnapshot.ServiceTicket("RL-9070-128", "ARM-A3", "서보 모터 열화로 반복 보정 필요", "P1", "open", 84, false),
                new LabSnapshot.ServiceTicket("RL-9070-129", "VISION-B1", "p99 추론 지연으로 픽앤플레이스 누락", "P1", t % 4 == 0 ? "auto-closed" : "open", 143, t % 4 == 0),
                new LabSnapshot.ServiceTicket("RL-9070-130", "GPU-RACK-2", "VRAM 파편화 이후 모델 로드 실패", "P2", "triage", 39, false),
                new LabSnapshot.ServiceTicket("RL-9070-131", "I/O-SPINE", "로그 flush 지연으로 제어 이벤트 누락", "P2", "open", 62, false)
        );

        List<LabSnapshot.LatencyHop> latencyChain = List.of(
                new LabSnapshot.LatencyHop("ingest", 18, 44, 86),
                new LabSnapshot.LatencyHop("planner", 31, 91, 214),
                new LabSnapshot.LatencyHop("vision", 42, 167, 430),
                new LabSnapshot.LatencyHop("policy", 55, 244, 680),
                new LabSnapshot.LatencyHop("actuator", 70, 330, 910)
        );

        List<LabSnapshot.RobotJoint> joints = List.of(
                new LabSnapshot.RobotJoint("base", 120, 210, 18 + wave * 12, 62 + burst * 12),
                new LabSnapshot.RobotJoint("shoulder", 220, 150, -24 + wave * 18, 71 + burst * 18),
                new LabSnapshot.RobotJoint("elbow", 330, 190, 41 - wave * 22, 58 + burst * 20),
                new LabSnapshot.RobotJoint("wrist", 420, 132, -12 + wave * 36, 49 + burst * 16),
                new LabSnapshot.RobotJoint("gripper", 490, 176, 8 - wave * 16, 46 + burst * 10)
        );

        LabSnapshot.PopupState popup = new LabSnapshot.PopupState(
                t % 3 == 0 ? "fake-system-alert" : "pay-to-skip",
                t % 3 == 0 ? "브라우저 보안 경고" : "로봇 큐 우선 처리",
                t % 3 == 0 ? "시스템 위협이 감지된 것처럼 보이지만 실제 브라우저 알림이 아닌 시뮬레이션입니다." : "연산 대기열이 길어졌습니다. 유료 우선권 CTA가 과도하게 노출됩니다.",
                t % 3 == 0 ? "즉시 보호 실행" : "지금 대기열 건너뛰기",
                29 - (t % 19)
        );

        LabSnapshot.BadgeState badge = new LabSnapshot.BadgeState(7, 0, true);
        return new LabSnapshot(Instant.now(), telemetry, scenarios, tickets, latencyChain, joints, popup, badge);
    }

    public Map<String, Object> trigger(int scenarioId) {
        int bounded = Math.max(1, Math.min(11, scenarioId));
        return Map.of(
                "scenarioId", bounded,
                "accepted", true,
                "eventId", "RL-9070-EVT-" + ThreadLocalRandom.current().nextInt(1000, 9999),
                "message", "시나리오 " + bounded + " 결함 신호를 PPO 학습 큐에 주입했습니다.",
                "timestamp", Instant.now().toString()
        );
    }

    private LabSnapshot.Scenario scenario(int id, String title, String defectClass, String signal, int t, double base) {
        double intensity = Math.min(1.0, base + Math.max(0, Math.sin((t + id) / 4.0)) * .16);
        String state = intensity > .88 ? "critical" : intensity > .72 ? "degraded" : "watch";
        return new LabSnapshot.Scenario(id, title, defectClass, signal, intensity, state);
    }

    private String state(double value, double limit) {
        return value >= limit ? "critical" : value >= limit * .82 ? "degraded" : "stable";
    }
}
