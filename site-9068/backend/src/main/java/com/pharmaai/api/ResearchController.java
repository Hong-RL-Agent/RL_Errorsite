package com.pharmaai.api;

import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ResearchController {
    @GetMapping("/dashboard")
    public Dashboard dashboard() {
        return new Dashboard(
                "PHARMA-AI",
                "http://localhost:9068",
                Instant.now().toString(),
                candidates(),
                workerTelemetry(),
                infrastructureTelemetry(),
                scenarios());
    }

    @PostMapping("/simulations/trigger")
    public SimulationRun trigger(@RequestParam(defaultValue = "worker-zombie-session") String scenarioId) {
        return new SimulationRun(
                UUID.randomUUID().toString(),
                scenarioId,
                "FAULT_REPRODUCED",
                Instant.now().toString(),
                "Regression harness captured the anti-pattern signal for PPO training.");
    }

    private List<DrugCandidate> candidates() {
        return List.of(
                new DrugCandidate("PAI-1042", "Kinase allosteric modulator", 0.94, "Phase 0 in-silico", "low"),
                new DrugCandidate("PAI-2188", "GPCR inverse agonist", 0.88, "Docking queue", "medium"),
                new DrugCandidate("PAI-3301", "Protease covalent probe", 0.81, "Toxicity review", "high"),
                new DrugCandidate("PAI-4717", "RNA folding stabilizer", 0.76, "ADMET refinement", "medium"));
    }

    private WorkerTelemetry workerTelemetry() {
        return new WorkerTelemetry(
                "shared-worker://pharma-ai-session-bus",
                17,
                5,
                3,
                "Zombie session contamination detected in simulation channel.");
    }

    private InfrastructureTelemetry infrastructureTelemetry() {
        return new InfrastructureTelemetry(
                "dev",
                Map.of("dev", 240, "prod", 60),
                Map.of("dev", 30, "prod", 300),
                Map.of("instance-a", 24, "instance-b", 8),
                "TLSv1.3",
                "sticky-session=false",
                ZoneId.systemDefault().toString());
    }

    private List<FaultScenario> scenarios() {
        return List.of(
                new FaultScenario("worker-zombie-session", "공유 워커 좀비 세션 상태 오염", "critical"),
                new FaultScenario("worker-port-leak", "Shared Worker 포트 미폐쇄 잔류 세션", "critical"),
                new FaultScenario("sab-corruption", "웹 워커 강제 종료 시 SharedArrayBuffer 데이터 파손", "high"),
                new FaultScenario("mfe-session-residue", "MFE 세션 전환 실패 및 데이터 잔류", "high"),
                new FaultScenario("early-hints-cache", "Early Hints와 캐시 정책 충돌", "medium"),
                new FaultScenario("rate-limit-drift", "Dev/Prod API Rate Limit 불일치", "high"),
                new FaultScenario("dns-ttl-drift", "DNS TTL 불일치 주소 드리프트", "medium"),
                new FaultScenario("pool-asymmetry", "DB 커넥션 풀 비대칭 구성", "high"),
                new FaultScenario("tls-version-mismatch", "SSL/TLS 프로토콜 버전 불일치", "critical"),
                new FaultScenario("sticky-session-missing", "로드 밸런서 Sticky Session 누락", "critical"),
                new FaultScenario("dst-duplicate-timestamp", "DST 전이 타임스탬프 중복", "medium"));
    }

    public record Dashboard(
            String platform,
            String publicOrigin,
            String generatedAt,
            List<DrugCandidate> candidates,
            WorkerTelemetry worker,
            InfrastructureTelemetry infrastructure,
            List<FaultScenario> scenarios) {
    }

    public record DrugCandidate(String id, String target, double confidence, String stage, String risk) {
    }

    public record WorkerTelemetry(String bus, int activePorts, int leakedPorts, int zombieSessions, String signal) {
    }

    public record InfrastructureTelemetry(
            String environment,
            Map<String, Integer> apiRateLimitPerMinute,
            Map<String, Integer> dnsTtlSeconds,
            Map<String, Integer> dbPoolByInstance,
            String tlsMinimum,
            String loadBalancer,
            String schedulerZone) {
    }

    public record FaultScenario(String id, String title, String severity) {
    }

    public record SimulationRun(String runId, String scenarioId, String status, String startedAt, String note) {
    }
}
