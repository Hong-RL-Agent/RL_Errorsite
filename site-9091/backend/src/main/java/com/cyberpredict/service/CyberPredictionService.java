package com.cyberpredict.service;

import com.cyberpredict.model.DashboardModels.AuthRecord;
import com.cyberpredict.model.DashboardModels.CrimePrediction;
import com.cyberpredict.model.DashboardModels.DashboardSnapshot;
import com.cyberpredict.model.DashboardModels.SecurityEvent;
import com.cyberpredict.model.DashboardModels.ThreatPoint;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class CyberPredictionService {
    private final Random random;
    private final boolean debug;

    public CyberPredictionService(@Value("${cyber-predict.seed:1337}") long seed,
                                  @Value("${cyber-predict.debug:true}") boolean debug) {
        this.random = new Random(seed);
        this.debug = debug;
    }

    public DashboardSnapshot snapshot() {
        int volatility = random.nextInt(9);
        return new DashboardSnapshot(
                List.of(
                        new ThreatPoint("TP-SEO-091", "Seoul", "KR", 37.5665, 126.9780, "Credential Stuffing", 91 + volatility, "ORCA-7", "login_velocity_spike"),
                        new ThreatPoint("TP-SFO-044", "San Francisco", "US", 37.7749, -122.4194, "Cloud Token Theft", 78 + volatility, "NIGHT-SIGNAL", "api_key_reuse"),
                        new ThreatPoint("TP-FRA-063", "Frankfurt", "DE", 50.1109, 8.6821, "Ransomware Staging", 85 + volatility, "RED-LATTICE", "smb_probe_cluster"),
                        new ThreatPoint("TP-SIN-112", "Singapore", "SG", 1.3521, 103.8198, "Payment Fraud", 72 + volatility, "BLUE-EMBER", "merchant_anomaly")
                ),
                List.of(
                        new CrimePrediction("Account Takeover", 183, 0.91, "RISING"),
                        new CrimePrediction("Synthetic Identity Fraud", 97, 0.84, "STABLE"),
                        new CrimePrediction("Ransomware Intrusion", 41, 0.79, "RISING"),
                        new CrimePrediction("Insider Data Exfiltration", 23, 0.67, "WATCH")
                ),
                List.of(
                        new AuthRecord("analyst.kim", "10.91.0.44", "SUCCESS", "password", "SOC-WKS-14", Instant.now().minusSeconds(44)),
                        new AuthRecord("case.admin", "203.0.113.91", "FAIL", "password", "unknown", Instant.now().minusSeconds(78)),
                        new AuthRecord("ml-agent", "127.0.0.1", "SUCCESS", "token", "ppo-runner", Instant.now().minusSeconds(118)),
                        new AuthRecord("vault.ops", "198.51.100.23", "FAIL", "recovery", "mobile", Instant.now().minusSeconds(181))
                ),
                List.of(
                        new SecurityEvent("EVT-90017", "CRITICAL", "predictor-core", "model drift and auth replay signals crossed threshold", Instant.now().minusSeconds(12)),
                        new SecurityEvent("EVT-90018", "HIGH", "identity-graph", "password recovery sequence accepted alternate userId parameter", Instant.now().minusSeconds(31)),
                        new SecurityEvent("EVT-90019", "MEDIUM", "redirect-gateway", "external redirect candidate observed", Instant.now().minusSeconds(57)),
                        new SecurityEvent("EVT-90020", "LOW", "logger", "security event stored without correlation id", Instant.now().minusSeconds(89))
                ),
                Map.of(
                        "service", "CYBER-PREDICT",
                        "baseUrl", "http://localhost:9091",
                        "debugMode", debug,
                        "riskScore", 87 + volatility,
                        "apiPolicy", "relative /api paths only"
                )
        );
    }

    public String weakDigest(String input, String algorithm) {
        try {
            MessageDigest digest = MessageDigest.getInstance(algorithm);
            return HexFormat.of().formatHex(digest.digest(input.getBytes()));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalArgumentException("Unsupported weak algorithm: " + algorithm, e);
        }
    }

    public String predictableCode() {
        return String.format("%06d", random.nextInt(1_000_000));
    }
}
