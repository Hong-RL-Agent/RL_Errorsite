package ai.melody.service;

import ai.melody.model.RegressionScenario;
import ai.melody.model.Severity;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class RegressionScenarioService {
    public List<RegressionScenario> findAll() {
        return List.of(
                scenario(1, "헬스 체크 폭주 자가 중단", Severity.CRITICAL, "Health Monitor",
                        "초당 120회 이상의 /actuator/health 호출",
                        "모니터가 장애로 오인하고 자기 자신의 스케줄러를 중단",
                        "토큰 버킷 제한, 프로브 분리, 연속 실패 3회 전까지 상태 유지",
                        "rate-limited", "health.rps=120", "selfStop.prevented=true"),
                scenario(2, "복구 우선순위 역전", Severity.HIGH, "Recovery Orchestrator",
                        "낮은 영향도의 캐시 재시작이 GPU 세션 복구보다 먼저 큐에 진입",
                        "중요 워크로드 복구 지연",
                        "비즈니스 영향도와 의존성 깊이 기반 우선순위 재계산",
                        "priority-corrected", "gpu.queue.rank=1", "cache.queue.rank=5"),
                scenario(3, "누적된 알림 폭주", Severity.HIGH, "Notification Bus",
                        "동일 장애가 5분간 700건 누적",
                        "Slack/Webhook 전송 폭주로 운영 채널 마비",
                        "상관관계 키 병합, 지수 백오프, 1분 digest 전환",
                        "deduplicated", "alerts.raw=700", "alerts.sent=4"),
                scenario(4, "자동 복구 스크립트 무한 재부팅 루프", Severity.CRITICAL, "Auto Recovery",
                        "복구 스크립트가 종료 코드 2를 재시작 성공으로 오판",
                        "서비스가 계속 재기동되어 세션이 모두 끊김",
                        "회로 차단기, 최대 3회 제한, 수동 승인 대기 상태",
                        "circuit-open", "restarts=3", "manualApproval=true"),
                scenario(5, "복구 시 자원 경합 연쇄 고갈", Severity.CRITICAL, "Resource Governor",
                        "동시 복구 잡 8개가 같은 모델 캐시와 GPU 메모리 요청",
                        "메모리 고갈 후 다른 정상 세션까지 실패",
                        "복구 세마포어, GPU/CPU 예산 예약, 큐 격리",
                        "throttled", "gpuBudget.used=72%", "recovery.parallelism=2"),
                scenario(6, "외부 페이지 체류에 의한 세션 만료", Severity.MEDIUM, "Session Manager",
                        "OAuth 또는 문서 페이지에서 40분 체류 후 복귀",
                        "작곡 세션 토큰 만료로 사용자 작업 유실",
                        "refresh grace window, local draft checkpoint, 복귀 시 재검증",
                        "checkpoint-restored", "idleMinutes=40", "draftRestored=true"),
                scenario(7, "외부 API 임시 링크 즉시 만료", Severity.HIGH, "External API",
                        "사전 서명 URL TTL이 clock skew 때문에 즉시 만료",
                        "샘플팩 또는 stem 다운로드 실패",
                        "서버 기준 시각 서명, 30초 skew 허용, 단회 재발급",
                        "resigned", "ttlSeconds=0", "skewCompensated=true"),
                scenario(8, "외부 인증 후 세션 문맥 유실", Severity.HIGH, "Auth Bridge",
                        "외부 인증 콜백이 state 파라미터 없이 도착",
                        "원래 작곡 트랙과 사용자 intent를 찾지 못함",
                        "state nonce 저장, SameSite=Lax 쿠키, 서버 측 context vault",
                        "context-relinked", "state.valid=true", "vault.hit=true"),
                scenario(9, "델타 업데이트 바이너리 체크섬 불일치", Severity.CRITICAL, "Updater",
                        "패치 파일 SHA-256과 매니페스트 값 불일치",
                        "손상된 모델 플러그인 적용 위험",
                        "원자적 다운로드, checksum 검증 실패 시 이전 버전 유지",
                        "rollback-kept", "checksum.match=false", "activeVersion=previous"),
                scenario(10, "백그라운드 좀비 프로세스 핸들 점유", Severity.HIGH, "Process Supervisor",
                        "렌더러 하위 프로세스가 종료 후 파일 핸들을 보유",
                        "프로젝트 저장과 업데이트가 실패",
                        "프로세스 그룹 종료, orphan scan, 핸들 lease 만료",
                        "reaped", "zombies=2", "handlesReleased=true"),
                scenario(11, "가속기 드라이버 버전 불일치에 의한 성능 하락", Severity.MEDIUM, "Accelerator Runtime",
                        "CUDA/DirectML 드라이버가 권장 런타임보다 낮음",
                        "추론 지연 증가와 실시간 파형 지터 발생",
                        "드라이버 매트릭스 검사, CPU fallback 표시, 성능 degrade 알림",
                        "degraded-mode", "latencyDelta=38%", "fallback=enabled"));
    }

    private RegressionScenario scenario(
            int id,
            String name,
            Severity severity,
            String subsystem,
            String trigger,
            String simulatedFault,
            String guardrail,
            String currentState,
            String... telemetry) {
        return new RegressionScenario(
                id, name, severity, subsystem, trigger, simulatedFault, guardrail, currentState, List.of(telemetry));
    }
}
