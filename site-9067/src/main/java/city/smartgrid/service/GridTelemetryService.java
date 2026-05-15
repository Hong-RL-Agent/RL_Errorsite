package city.smartgrid.service;

import city.smartgrid.model.GridSnapshot;
import city.smartgrid.model.GridZone;
import city.smartgrid.model.RegressionScenario;
import city.smartgrid.model.WorkerState;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.IntStream;
import org.springframework.stereotype.Service;

@Service
public class GridTelemetryService {
  public GridSnapshot snapshot() {
    var rnd = ThreadLocalRandom.current();
    var zones = List.of(
        zone("A1", "Central Relay", 820, 1000, rnd),
        zone("B4", "Harbor Storage", 610, 760, rnd),
        zone("C7", "Industrial Arc", 1120, 1200, rnd),
        zone("D2", "Metro Core", 940, 980, rnd));
    double total = zones.stream().mapToDouble(GridZone::load).sum();
    double capacity = zones.stream().mapToDouble(GridZone::capacity).sum();
    double stability = Math.max(0, Math.min(100, 100 - ((total / capacity) * 18) + rnd.nextDouble(-2.5, 2.5)));

    return new GridSnapshot(
        Instant.now(),
        round(total),
        round(stability),
        round(58 + rnd.nextDouble(28)),
        zones,
        List.of(
            new WorkerState("WW-RENDER-01", "grid-map", pickState(rnd), rnd.nextInt(3, 38), System.nanoTime() % 90000, "deadlock-watch"),
            new WorkerState("SWW-BUS-02", "shared-tab-bus", pickState(rnd), rnd.nextInt(12, 94), System.nanoTime() % 60000, "message-id-collision"),
            new WorkerState("WW-ORDER-03", "telemetry-queue", pickState(rnd), rnd.nextInt(20, 130), System.nanoTime() % 70000, "queue-reversal"),
            new WorkerState("SW-SCHEMA-04", "service-worker", pickState(rnd), rnd.nextInt(1, 21), System.nanoTime() % 80000, "schema-drift")));
  }

  public List<RegressionScenario> regressions() {
    return List.of(
        scenario(1, "멀티 인스턴스 전력 분배 업데이트 시 DB 자원 잠금 현상", "DB/Transaction", "동일 구역 quota row를 4개 인스턴스가 pessimistic update", "락 대기 누적으로 배전 명령 지연", "lock_wait_ms, deadlock_count", "critical"),
        scenario(2, "NPU 드라이버와 런타임 버전 비호환에 따른 연산 중단", "NPU Runtime", "driver ABI 2.1, runtime ABI 2.3 혼재", "전력 예측 커널 로드 실패", "npu_runtime_abi_mismatch", "critical"),
        scenario(3, "업데이트 중 심볼릭 링크 교체 시 발생하는 레이스 컨디션", "Updater", "active 모델 symlink를 readers 동작 중 교체", "일부 노드가 이전 가중치와 신규 설정을 혼합 사용", "model_inode_switch_gap", "high"),
        scenario(4, "NPU 컴파일러 캐시 파일 손상에 의한 전력 계산 오차", "Compiler Cache", "캐시 blob checksum mismatch를 무시하고 실행", "MW 예측값 편차 확대", "cache_checksum_error, prediction_delta", "high"),
        scenario(5, "델타 업데이트 시 백신 프로그램의 파일 잠금으로 인한 타임아웃", "Patch IO", "delta shard 쓰기 중 외부 파일 핸들 점유", "패치 롤백과 런타임 부분 적용", "patch_file_lock_timeout", "medium"),
        scenario(6, "업데이트 패치 중 AI 가중치 비트 반전(Bit-flip)으로 인한 할당량 폭주", "Model Integrity", "quantized weight의 단일 비트 반전", "특정 구역 전력 할당량 급증", "weight_crc_failure, quota_spike", "critical"),
        scenario(7, "실시간 렌더링용 웹 워커 간의 상태 전이 교착 상태(Deadlock)", "Web Worker", "render worker와 aggregation worker가 서로 ACK 대기", "그리드 맵 프레임 정지", "worker_ack_stall", "high"),
        scenario(8, "다중 탭 환경에서 공유 웹 워커 메시지 ID 충돌 현상", "Shared Worker", "탭별 로컬 counter를 전역 ID처럼 사용", "다른 탭 응답이 현재 탭에 매칭", "duplicate_message_id", "high"),
        scenario(9, "웹 워커 메시지 큐 적체로 인한 데이터 전송 순서 역전", "Queueing", "긴 계산 task 뒤에 최신 telemetry가 먼저 commit", "시간축 역전 그래프 표시", "out_of_order_sequence", "medium"),
        scenario(10, "구버전 서비스 워커의 잔류로 인한 데이터 스키마 불일치", "Service Worker", "old SW가 v1 payload를 cache에서 반환", "프론트 v2 parser 예외", "schema_version_mismatch", "high"),
        scenario(11, "BF 캐시 복원 시 웹 워커 토큰 동기화 실패 및 통신 거부", "Browser Lifecycle", "pageshow persisted=true 이후 worker token 미갱신", "복원 탭의 worker command 거부", "bf_cache_token_reject", "medium"));
  }

  private GridZone zone(String id, String name, double base, double capacity, ThreadLocalRandom rnd) {
    double load = Math.max(100, base + rnd.nextDouble(-70, 95));
    String status = load / capacity > 0.92 ? "overload" : load / capacity > 0.78 ? "watch" : "stable";
    return new GridZone(id, name, round(load), capacity, status, wave(load, rnd));
  }

  private List<Double> wave(double base, ThreadLocalRandom rnd) {
    return IntStream.range(0, 28)
        .mapToDouble(i -> round(base + Math.sin(i / 2.0) * 32 + rnd.nextDouble(-15, 15)))
        .boxed()
        .toList();
  }

  private String pickState(ThreadLocalRandom rnd) {
    return List.of("RUNNING", "BACKPRESSURE", "WAITING_ACK", "RECOVERING").get(rnd.nextInt(4));
  }

  private RegressionScenario scenario(int id, String title, String layer, String trigger, String failure, String detector, String severity) {
    return new RegressionScenario(id, title, layer, trigger, failure, detector, severity);
  }

  private double round(double value) {
    return Math.round(value * 10.0) / 10.0;
  }
}
