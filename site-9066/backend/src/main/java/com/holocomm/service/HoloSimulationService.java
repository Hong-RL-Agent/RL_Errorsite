package com.holocomm.service;

import com.holocomm.model.HoloModels.FaultScenario;
import com.holocomm.model.HoloModels.ParticipantMetric;
import com.holocomm.model.HoloModels.SystemStatus;
import com.holocomm.model.HoloModels.TelemetryFrame;
import com.holocomm.model.HoloModels.TerminalLog;
import com.holocomm.model.HoloModels.VramGauge;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class HoloSimulationService {
  private final AtomicLong tick = new AtomicLong();
  private final String publicBaseUrl;

  public HoloSimulationService(@Value("${holo.public-base-url}") String publicBaseUrl) {
    this.publicBaseUrl = publicBaseUrl;
  }

  public SystemStatus status() {
    return new SystemStatus(
        publicBaseUrl,
        "holo-renderer-3.7.9066",
        "point-cloud-prism",
        "cors:/api@localhost:9066",
        Instant.now()
    );
  }

  public TelemetryFrame telemetry() {
    long frame = tick.incrementAndGet();
    ThreadLocalRandom random = ThreadLocalRandom.current();
    List<ParticipantMetric> participants = List.of(
        participant("p01", "Seoul Relay", 18, 42, frame),
        participant("p02", "Berlin Lab", 31, 57, frame + 7),
        participant("p03", "Toronto XR", 24, 61, frame + 13),
        participant("p04", "Singapore Ops", 15, 38, frame + 19)
    );
    double wave = (Math.sin(frame / 5.0) + 1) / 2;
    double used = 9.4 + wave * 5.1 + random.nextDouble(0.0, 0.8);
    double fragmented = 0.8 + ((Math.cos(frame / 8.0) + 1) / 2) * 2.7;
    double zombie = frame % 11 > 6 ? 1.8 + random.nextDouble(0.3, 1.4) : random.nextDouble(0.1, 0.8);
    int utilization = Math.min(98, (int) Math.round((used / 16.0) * 100));
    return new TelemetryFrame(
        frame,
        participants,
        new VramGauge(16, round(used), round(fragmented), round(zombie), utilization),
        68000 + (int) (wave * 42000),
        12 + (int) (Math.abs(Math.sin(frame / 9.0)) * 47),
        (int) (frame % 6)
    );
  }

  public List<FaultScenario> scenarios() {
    return List.of(
        scenario(1, "환경변수 섀도잉 구버전 엔진 실행", "Installer", "PATH 우선순위가 legacy/bin을 먼저 참조", "engine_version_mismatch", "설치 후 PATH 정규화 및 서명된 런처 고정", "HIGH", true),
        scenario(2, "OS Smart App Control 평판 차단", "Security", "평판 미등록 업데이트 바이너리 실행", "binary_reputation_block", "코드 서명, 평판 워밍, 격리 큐 재시도", "CRITICAL", true),
        scenario(3, "동적 라이브러리 Search Path 충돌", "Runtime", "현재 작업 디렉터리 DLL이 vendor DLL보다 우선", "library_shadow_collision", "절대 경로 로딩과 해시 검증", "HIGH", true),
        scenario(4, "NPU 컴파일러/런타임 버전 불일치", "Accelerator", "compiler 2.9 산출물을 runtime 2.6에서 실행", "npu_runtime_drift", "컴파일러-런타임 호환성 매트릭스 게이트", "HIGH", true),
        scenario(5, "델타 패치 원본 바이너리 손상", "Updater", "base hash 불일치 상태에서 delta 적용", "delta_patch_corrupt_base", "패치 전 원본 해시 검증 및 전체 패키지 폴백", "CRITICAL", true),
        scenario(6, "실시간 모델 교체 GPU 메모리 파편화", "Renderer", "모델 언로드 직후 대형 텐서 할당", "gpu_fragmentation_oom", "세대별 VRAM 풀 압축 및 교체 윈도우 제한", "CRITICAL", true),
        scenario(7, "업데이트 바이너리 Sandbox 네트워크 격리", "Network", "업데이트 프로세스가 egress deny 정책으로 CDN 접근 실패", "sandbox_egress_denied", "업데이트 전용 정책 라벨과 프록시 경유", "HIGH", true),
        scenario(8, "임시 파일 GC 실패 디스크 점유", "Storage", "업데이트 후 .holo-tmp 파일 핸들 미해제", "temp_gc_leak", "세션별 임시 디렉터리와 종료 훅 정리", "MEDIUM", true),
        scenario(9, "VRAM 좀비 점유", "Renderer", "모델 교체 후 그래프 참조가 남아 VRAM 해제 실패", "zombie_vram_retention", "참조 카운트 추적 및 강제 dispose", "HIGH", true),
        scenario(10, "App Translocation 리소스 경로 단절", "OS Policy", "격리 실행 경로에서 상대 리소스 탐색", "translocated_resource_missing", "앱 번들 기준 리소스 resolver 사용", "MEDIUM", true),
        scenario(11, "Zstandard 하위 호환성 결여", "Packaging", "zstd v1.5 dictionary 패키지를 v1.4 클라이언트가 해제", "zstd_backward_incompat", "압축 feature flag와 최소 버전 협상", "MEDIUM", true)
    );
  }

  public List<TerminalLog> logs() {
    long frame = tick.get();
    return List.of(
        log("INFO", "proxy", "active gateway locked to http://localhost:9066/api"),
        log("WARN", "renderer", "VRAM fragmentation window detected: frame=" + frame),
        log("BLOCK", "policy", "sandbox egress denied for unsigned updater job"),
        log("ERROR", "patcher", "delta base hash mismatch, falling back to full package"),
        log("INFO", "ppo", "fault vectors exported for regression reward shaping")
    );
  }

  private ParticipantMetric participant(String id, String name, int audioBase, int videoBase, long phase) {
    int audio = audioBase + (int) (Math.abs(Math.sin(phase / 4.0)) * 19);
    int video = videoBase + (int) (Math.abs(Math.cos(phase / 5.0)) * 31);
    int loss = (int) (Math.abs(Math.sin(phase / 6.0)) * 17);
    String state = video > 78 ? "DEGRADED" : "SYNCED";
    return new ParticipantMetric(id, name, audio, video, loss, state);
  }

  private FaultScenario scenario(int id, String title, String subsystem, String trigger, String ppoSignal,
      String mitigation, String severity, boolean active) {
    return new FaultScenario(id, title, subsystem, trigger, ppoSignal, mitigation, severity, active);
  }

  private TerminalLog log(String level, String source, String message) {
    return new TerminalLog(Instant.now(), level, source, message);
  }

  private double round(double value) {
    return Math.round(value * 10.0) / 10.0;
  }
}
