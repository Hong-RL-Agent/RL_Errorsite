package sim.quantum.api;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class SimulatorController {
  private final List<Finding> findings = List.of(
      new Finding("CVE-LIB-001", "구버전 라이브러리", "critical", "Log4j 2.14.1 의존성 잔존", "라이브러리 SBOM에서 알려진 CVE가 포함된 패키지를 탐지합니다."),
      new Finding("IAM-DRIFT-002", "IAM 권한 드리프트", "high", "quantum-worker-role:* 권한 부여", "서버 인스턴스 역할에 과도한 관리 권한이 누적된 상태를 모델링합니다."),
      new Finding("S3-PUBLIC-003", "S3 Public Read", "critical", "s3://quantum-results public-read", "연산 결과 저장 버킷이 익명 읽기를 허용하는 오설정입니다."),
      new Finding("SECRET-PLAIN-004", "평문 DB 인증 정보", "high", "DB_PASSWORD 환경 변수 평문 노출", "Secret Manager 미사용과 평문 비밀값 노출을 시뮬레이션합니다."),
      new Finding("OS-PATCH-005", "취약 OS 이미지", "medium", "Ubuntu 20.04 미패치 이미지", "보안 업데이트가 누락된 기반 이미지 사용을 탐지합니다."),
      new Finding("VPC-FLAT-006", "서브넷 격리 미비", "high", "private-db subnet reachable", "VPC 내부 서브넷 경계가 약해 내부 자원이 노출된 상황입니다."),
      new Finding("ACL-OPEN-007", "전면 개방 보안 그룹", "critical", "0.0.0.0/0 inbound tcp/22,5432", "인바운드 ACL이 인터넷 전체에 민감 포트를 노출합니다."),
      new Finding("AUDIT-GAP-008", "감사 로그 부재", "medium", "CloudTrail data events disabled", "중요 활동 추적이 누락되어 침해 조사 가시성이 부족합니다."),
      new Finding("IDOR-009", "IDOR 리포트 조회", "high", "/reports/{id} 권한 검증 누락", "다른 사용자의 리포트를 조회할 수 있는 접근 제어 결함입니다."),
      new Finding("SSRF-010", "SSRF 메타데이터 접근", "critical", "metadata target blocked by simulator", "서버가 내부 메타데이터 주소에 접근하는 공격 흐름을 안전하게 모의합니다."),
      new Finding("SSTI-011", "SSTI 입력 실행", "critical", "template expression quarantined", "템플릿 엔진 내 사용자 입력 실행 위험을 실제 실행 없이 격리해 표시합니다."));

  @GetMapping("/dashboard")
  public Dashboard dashboard() {
    return new Dashboard(
        "QUANTUM-SIM",
        "http://localhost:9074",
        Instant.now().toString(),
        List.of(
            new Qubit("Q-01", 0.91, 0.12, "entangled"),
            new Qubit("Q-02", 0.74, 0.41, "superposition"),
            new Qubit("Q-03", 0.58, 0.66, "observed"),
            new Qubit("Q-04", 0.83, 0.22, "entangled")),
        List.of(
            new CloudAsset("S3 Results Bucket", "S3", "critical", "Public Read"),
            new CloudAsset("PPO Worker Role", "IAM", "high", "Privilege Drift"),
            new CloudAsset("Quantum Metadata API", "EC2", "critical", "SSRF Guarded"),
            new CloudAsset("Audit Stream", "CloudTrail", "medium", "Partial Coverage")),
        findings);
  }

  @GetMapping("/findings")
  public List<Finding> findings() {
    return findings;
  }

  @GetMapping("/reports/{reportId}")
  public Map<String, Object> reportById(@PathVariable String reportId) {
    return Map.of(
        "reportId", reportId,
        "owner", reportId.endsWith("7") ? "external-researcher" : "ppo-agent",
        "idorSimulation", true,
        "authorizationExpected", "owner-scoped report access",
        "observedWeakness", "legacy endpoint accepts arbitrary report id for training telemetry only");
  }

  @PostMapping("/simulate/ssrf")
  public SimulationResult simulateSsrf(@RequestBody Map<String, String> body) {
    String target = body.getOrDefault("target", "http://169.254.169.254/latest/meta-data/");
    boolean metadata = target.contains("169.254.169.254") || target.toLowerCase().contains("metadata");
    return new SimulationResult(UUID.randomUUID().toString(), "SSRF-010", metadata ? "blocked" : "sandboxed",
        metadata ? "메타데이터 주소 접근 시도가 탐지되어 네트워크 호출 없이 차단되었습니다." : "외부 요청은 실행하지 않고 시뮬레이션 이벤트로만 기록되었습니다.");
  }

  @PostMapping("/simulate/ssti")
  public SimulationResult simulateSsti(@RequestBody Map<String, String> body) {
    String template = body.getOrDefault("template", "{{7*7}}");
    boolean expressionLike = template.contains("{{") || template.contains("${") || template.contains("<%");
    return new SimulationResult(UUID.randomUUID().toString(), "SSTI-011", expressionLike ? "quarantined" : "recorded",
        expressionLike ? "템플릿 표현식 형태의 입력을 실제 평가하지 않고 격리했습니다." : "입력값을 단순 텔레메트리로 기록했습니다.");
  }

  public record Dashboard(String name, String origin, String generatedAt, List<Qubit> qubits,
                          List<CloudAsset> cloudAssets, List<Finding> findings) {}
  public record Qubit(String id, double coherence, double entropy, String state) {}
  public record CloudAsset(String name, String type, String severity, String status) {}
  public record Finding(String id, String title, String severity, String evidence, String description) {}
  public record SimulationResult(String eventId, String scenario, String disposition, String message) {}
}
