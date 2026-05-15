package com.biopay.service;

import com.biopay.model.DashboardSnapshot;
import com.biopay.model.DefectScenario;
import com.biopay.model.FaultProbe;
import com.biopay.model.InstallStage;
import com.biopay.model.InventoryItem;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {
    public DashboardSnapshot snapshot() {
        return new DashboardSnapshot(
                Instant.now(),
                98.73,
                96.41,
                18420,
                17,
                List.of(91, 93, 94, 92, 96, 97, 95, 98, 97, 99, 98, 97),
                inventory(),
                installStages(),
                defects()
        );
    }

    public List<DefectScenario> defects() {
        return List.of(
                new DefectScenario(1, "콜드 부트 실패를 동반한 설정값 오염", "bootstrap", "critical",
                        "config.seed가 재시작 후 null profile을 주입", "초기 설정과 런타임 보정값을 같은 mutable store에 저장", 18, true),
                new DefectScenario(2, "델타 업데이트 바이너리 체크섬 불일치", "delta-patch", "high",
                        "sha256 manifest와 patch blob digest 불일치", "부분 다운로드를 성공 상태로 캐싱", 42, true),
                new DefectScenario(3, "업데이트 중 롤백 실패 시나리오", "rollback", "critical",
                        "rollback marker는 생성됐지만 이전 bundle pointer가 소실", "원자적 스왑 없이 활성 경로를 먼저 갱신", 63, true),
                new DefectScenario(4, "온디바이스 AI 모델 가중치 데이터 손상", "model-sync", "high",
                        "face-liveness-v7 weights tensor shape mismatch", "모델 파일과 메타데이터를 독립 커밋", 55, true),
                new DefectScenario(5, "설치 중 임시 디렉터리(/tmp) 할당량 초과", "install", "medium",
                        "/tmp staging free space below 2 percent", "임시 파일 정리 없이 압축 해제를 반복", 76, true),
                new DefectScenario(6, "보안 라이브러리 심볼릭 링크 순환 참조", "linker", "high",
                        "libbiosec.so -> current/libbiosec.so -> ../libbiosec.so", "심볼릭 링크 검증을 depth 제한 없이 수행", 34, true),
                new DefectScenario(7, "사용자 디스크 쿼타 초과에 따른 침묵하는 설치 실패", "install", "medium",
                        "installer exit code 0, artifact size 0 bytes", "quota 예외를 warning 로그로만 처리", 69, true),
                new DefectScenario(8, "가상화 샌드박스 내 구버전 라이브러리 섀도잉", "sandbox", "high",
                        "sandbox LD path resolves crypto provider 1.1.1", "컨테이너 경로가 호스트 보안 라이브러리보다 우선", 49, true),
                new DefectScenario(9, "환경 변수 길이 제한에 따른 경로 누락", "environment", "medium",
                        "BIOPAY_PLUGIN_PATH tail segment truncated", "긴 경로를 압축하지 않고 단일 env var에 누적", 58, true),
                new DefectScenario(10, "무결성 자가 치유 로직의 무한 루프", "self-heal", "critical",
                        "repair-attempt counter resets on every supervisor fork", "복구 상태를 프로세스 메모리에만 저장", 91, true),
                new DefectScenario(11, "서명 만료 및 로컬 시간 불일치 오판", "signature", "high",
                        "device local time +19h, valid signature rejected", "NTP 신뢰도 확인 전 인증서 만료를 판정", 27, true)
        );
    }

    public FaultProbe probe(int id) {
        DefectScenario scenario = defects().stream()
                .filter(defect -> defect.id() == id)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown BIO-PAY defect scenario: " + id));

        return switch (id) {
            case 1 -> new FaultProbe(id, scenario.phase(), "cold-boot-failed",
                    List.of("profile checksum passed before reboot", "runtime override polluted bootstrap seed", "node enters safe mode"),
                    scenario.antiPattern(), "split immutable install config from mutable runtime tuning");
            case 2 -> new FaultProbe(id, scenario.phase(), "checksum-mismatch",
                    List.of("delta block 14 accepted from partial cache", "manifest digest mismatch", "promotion gate remains pending"),
                    scenario.antiPattern(), "verify every resumed byte range before marking a delta reusable");
            case 3 -> new FaultProbe(id, scenario.phase(), "rollback-pointer-missing",
                    List.of("active slot switched before checkpoint fsync", "rollback marker exists", "previous bundle pointer empty"),
                    scenario.antiPattern(), "commit inactive bundle and rollback pointer before activation");
            case 4 -> new FaultProbe(id, scenario.phase(), "model-corrupt",
                    List.of("model metadata version 9.8.0", "weights tensor reports incompatible shape", "liveness inference disabled"),
                    scenario.antiPattern(), "treat model weights and metadata as one content-addressed bundle");
            case 5 -> new FaultProbe(id, scenario.phase(), "tmp-quota-exceeded",
                    List.of("staging expands to /tmp/biopay-edge", "free space below threshold", "cleanup job starts after failure"),
                    scenario.antiPattern(), "preflight quota and stream extraction into bounded staging");
            case 6 -> new FaultProbe(id, scenario.phase(), "symlink-cycle",
                    List.of("resolver follows libbiosec.so", "same inode revisited", "loader health probe times out"),
                    scenario.antiPattern(), "cap link traversal depth and reject repeated canonical paths");
            case 7 -> new FaultProbe(id, scenario.phase(), "silent-install-failure",
                    List.of("quota exception downgraded to warning", "installer returns zero", "artifact file is empty"),
                    scenario.antiPattern(), "promote quota errors to hard failures with artifact size validation");
            case 8 -> new FaultProbe(id, scenario.phase(), "library-shadowed",
                    List.of("sandbox path prepended to loader search", "old crypto provider resolved", "policy engine flags ABI drift"),
                    scenario.antiPattern(), "pin trusted library paths and audit container search order");
            case 9 -> new FaultProbe(id, scenario.phase(), "env-path-truncated",
                    List.of("plugin path exceeds platform limit", "tail segment dropped", "payment risk plugin not discovered"),
                    scenario.antiPattern(), "store long path lists in manifest files instead of process env");
            case 10 -> new FaultProbe(id, scenario.phase(), "self-heal-loop",
                    List.of("repair attempt starts", "supervisor forks worker", "attempt counter resets to zero"),
                    scenario.antiPattern(), "persist repair state outside worker process memory");
            case 11 -> new FaultProbe(id, scenario.phase(), "signature-time-skew",
                    List.of("device clock leads trusted time by 19 hours", "certificate marked expired", "valid package rejected"),
                    scenario.antiPattern(), "validate trusted time source confidence before signature expiry decisions");
            default -> throw new IllegalArgumentException("Unknown BIO-PAY defect scenario: " + id);
        };
    }

    private List<InventoryItem> inventory() {
        return List.of(
                new InventoryItem("Palm vein verifier", "7.14.2", "verified", "ap-northeast", "+0.2%"),
                new InventoryItem("Face liveness model", "9.8.0", "watch", "us-east", "+3.7%"),
                new InventoryItem("Payment token vault", "4.22.1", "verified", "eu-central", "-0.1%"),
                new InventoryItem("Secure enclave bridge", "3.6.9", "quarantine", "us-west", "+8.4%"),
                new InventoryItem("Risk scoring stream", "12.3.5", "verified", "global", "+1.1%")
        );
    }

    private List<InstallStage> installStages() {
        return List.of(
                new InstallStage("Manifest pinning", 100, "sealed", "root digest fixed to BIO-PAY release channel"),
                new InstallStage("Delta payload verify", 72, "degraded", "checksum retry storm detected"),
                new InstallStage("Model bundle hydrate", 58, "watch", "edge tensor pack awaiting revalidation"),
                new InstallStage("Rollback checkpoint", 35, "blocked", "previous slot metadata missing"),
                new InstallStage("Fleet activation", 81, "gated", "17 nodes quarantined before promotion")
        );
    }
}
