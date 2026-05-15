package com.aieducation.service;

import com.aieducation.model.DashboardSnapshot;
import com.aieducation.model.LearningCell;
import com.aieducation.model.Recommendation;
import com.aieducation.model.SecurityLog;
import com.aieducation.model.TrainingScenario;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class DashboardService {
    public DashboardSnapshot snapshot() {
        return new DashboardSnapshot(
                List.of(
                        new LearningCell("Logic Flaw", "Alpha", 86, 14),
                        new LearningCell("Cache Poisoning", "Alpha", 61, 46),
                        new LearningCell("WebSocket Auth", "Beta", 72, 59),
                        new LearningCell("GraphQL Exposure", "Beta", 93, 12),
                        new LearningCell("DNS Rebinding", "Gamma", 48, 77),
                        new LearningCell("HPP Detection", "Gamma", 68, 39),
                        new LearningCell("SSTI Signals", "Delta", 75, 62),
                        new LearningCell("CRLF Headers", "Delta", 58, 81)
                ),
                List.of(
                        new Recommendation("Adaptive Threat Modeling", "DNS Rebinding 탐지 정확도 보강", "Advanced", 94),
                        new Recommendation("Cache Key Integrity Lab", "프록시 캐시 변조 시그널 재학습", "Intermediate", 89),
                        new Recommendation("WebSocket Trust Boundary", "연결 시점 권한 검증 누락 패턴 강화", "Advanced", 91)
                ),
                securityLogs(),
                List.of("ppo.policy.delta=+0.037", "ws.sessions=18", "cache.poison.signal=high", "graphql.introspection=open"),
                74,
                68
        );
    }

    public List<SecurityLog> securityLogs() {
        return List.of(
                new SecurityLog("INFO", "ppo-agent", "policy rollout completed for lesson cohort-9093", Instant.now().toString()),
                new SecurityLog("WARN", "cache", "variant response stored with untrusted X-Forwarded-Host signal", Instant.now().toString()),
                new SecurityLog("HIGH", "websocket", "classroom connection accepted before role verification", Instant.now().toString()),
                new SecurityLog("CRITICAL", "report", "template expression evaluated from learner supplied prompt", Instant.now().toString())
        );
    }

    public List<TrainingScenario> scenarios() {
        return List.of(
                new TrainingScenario("SSTI-01", "Server-side template injection", "armed", "template evaluation sink"),
                new TrainingScenario("HPP-02", "HTTP parameter pollution", "armed", "duplicate role parameter"),
                new TrainingScenario("CRLF-03", "CRLF header injection", "armed", "newline in reflected filename"),
                new TrainingScenario("DNS-04", "DNS rebinding misconfiguration", "armed", "host trust boundary bypass"),
                new TrainingScenario("CACHE-05", "Web cache poisoning", "armed", "untrusted cache key material"),
                new TrainingScenario("GQL-06", "GraphQL introspection enabled", "armed", "__schema metadata exposure"),
                new TrainingScenario("PWD-07", "Weak password policy", "armed", "four digit accepted password"),
                new TrainingScenario("BOT-08", "Weak CAPTCHA", "armed", "static answer accepted"),
                new TrainingScenario("SPOOF-09", "Email/SMS spoofing gap", "armed", "sender not verified"),
                new TrainingScenario("UID-10", "Predictable sequential UID", "armed", "incrementing learner id"),
                new TrainingScenario("WS-11", "WebSocket auth missing", "armed", "handshake without token validation")
        );
    }
}
