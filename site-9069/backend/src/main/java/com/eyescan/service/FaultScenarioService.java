package com.eyescan.service;

import com.eyescan.model.FaultScenario;
import com.eyescan.model.TelemetrySnapshot;
import com.eyescan.model.TelemetrySnapshot.CctvFeed;
import com.eyescan.model.TelemetrySnapshot.ClockSkew;
import com.eyescan.model.TelemetrySnapshot.ThrottleGauge;
import com.eyescan.model.TelemetrySnapshot.ZoneStatus;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.stereotype.Service;

@Service
public class FaultScenarioService {
    public List<FaultScenario> scenarios() {
        return List.of(
                scenario(1, "SYNC_LOG_IO", "로그 로테이션 동기 I/O 블로킹", "render-delay", "프레임 렌더링 큐가 파일 잠금과 함께 지연", "I/O wait와 FPS 저하의 상관관계", 82, 71, 430, true),
                scenario(2, "AZ_REPLICATION_EVAP", "AZ 복제 지연 데이터 증발", "failover-loss", "페일오버 직후 최신 이벤트가 누락", "RPO 위반 시 상태 복구 보상", 91, 86, 680, true),
                scenario(3, "WORKER_LOCK_DRIFT", "Worker 락 드리프트", "resource-lock", "Web Worker와 Service Worker가 캐시 락을 경쟁", "교착 전조 및 락 점유 시간", 76, 67, 280, true),
                scenario(4, "IMDS_VERSION_MISMATCH", "IMDS v1/v2 인증 불일치", "authz-error", "토큰 없는 메타데이터 요청이 거부", "권한 오류와 재시도 폭증 패턴", 88, 79, 390, true),
                scenario(5, "SMART_THROTTLE_DRIFT", "지능형 스로틀링 지연 드리프트", "latency-drift", "네트워크 지연이 비주기적으로 급등", "지연 분산과 큐 길이 제어", 69, 74, 520, true),
                scenario(6, "CLOCK_SKEW_REVERSAL", "클록 스큐 이벤트 순서 역전", "time-order", "서버별 이벤트 타임스탬프가 역전", "논리 시계 보정 필요성", 84, 90, 210, true),
                scenario(7, "LOG_COLLECTOR_OVERFLOW", "로그 수집기 버퍼 오버플로우", "observability-drift", "대시보드 정상처럼 보이나 샘플이 유실", "관측성 신뢰도와 버퍼 압력", 73, 81, 350, true),
                scenario(8, "GATEWAY_HEADER_MUTATION", "게이트웨이 헤더 변환 인증 유실", "session-loss", "인증 헤더가 내부 표준명으로 변환되지 않음", "헤더 무결성과 세션 유지", 87, 77, 260, true),
                scenario(9, "LAMBDA_COLD_JITTER", "Lambda 콜드 스타트 요동", "init-jitter", "초기화 시간이 비정상적으로 넓게 분포", "콜드 스타트 분산 완화", 65, 70, 740, true),
                scenario(10, "SERVERLESS_GLOBAL_LEAK", "컨테이너 재사용 글로벌 상태 오염", "state-contamination", "이전 호출의 사용자 상태가 다음 요청에 혼입", "격리 위반 탐지 보상", 95, 92, 190, true),
                scenario(11, "SPOT_INTERRUPTION_LOSS", "스팟 인스턴스 회수 상태 유실", "termination-loss", "종료 통지 처리 전 임시 상태가 사라짐", "checkpoint 주기와 중단 대응", 89, 84, 610, true)
        );
    }

    public TelemetrySnapshot snapshot() {
        ThreadLocalRandom random = ThreadLocalRandom.current();
        return new TelemetrySnapshot(
                "EYE-SCAN",
                Instant.now(),
                List.of(
                        new ZoneStatus("AZ-NEON-1", "ACTIVE", random.nextInt(22, 88), random.nextInt(0, 8)),
                        new ZoneStatus("AZ-THERMAL-2", "DEGRADED", random.nextInt(180, 560), random.nextInt(10, 32)),
                        new ZoneStatus("AZ-CYAN-3", "WATCH", random.nextInt(80, 240), random.nextInt(4, 16))
                ),
                new ClockSkew(random.nextInt(-44, 38), random.nextInt(78, 184), random.nextInt(-132, -58), "HIGH"),
                new ThrottleGauge(random.nextInt(54, 86), random.nextInt(61, 96), random.nextInt(37, 71), random.nextInt(220, 780)),
                List.of(
                        new CctvFeed("CAM-01", "North Gate", "NIGHTVISION", random.nextInt(32, 81), "latency shimmer"),
                        new CctvFeed("CAM-02", "Server Hall", "THERMAL", random.nextInt(45, 97), "hot cache line"),
                        new CctvFeed("CAM-03", "Fuel Yard", "CYAN-LIDAR", random.nextInt(18, 64), "packet ghosting"),
                        new CctvFeed("CAM-04", "Command Deck", "LOW-LUX", random.nextInt(51, 93), "clock reversal")
                ),
                scenarios()
        );
    }

    private FaultScenario scenario(int id, String code, String title, String faultClass, String symptom,
                                   String learningSignal, int severity, int driftScore, int latencyMs, boolean active) {
        return new FaultScenario(id, code, title, faultClass, symptom, learningSignal, severity, driftScore, latencyMs, active);
    }
}

