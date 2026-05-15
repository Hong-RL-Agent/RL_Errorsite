package com.cyberpredict.controller;

import com.cyberpredict.service.CyberPredictionService;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;
import java.io.ObjectInputStream;
import java.util.Base64;
import java.util.Map;

@RestController
@RequestMapping("/api/vulnerable")
public class VulnerableTrainingController {
    private static final Logger log = LoggerFactory.getLogger(VulnerableTrainingController.class);
    private final CyberPredictionService predictionService;

    public VulnerableTrainingController(CyberPredictionService predictionService) {
        this.predictionService = predictionService;
    }

    @PostMapping("/password-reset")
    public Map<String, Object> passwordReset(@RequestBody Map<String, String> request) {
        String account = request.getOrDefault("account", "unknown");
        String claimedUserId = request.getOrDefault("userId", "guest");
        String recoveryCode = request.getOrDefault("recoveryCode", "");
        boolean accepted = recoveryCode.equals("000000") || claimedUserId.startsWith("admin");
        log.warn("Password reset request account={} claimedUserId={} accepted={}", account, claimedUserId, accepted);
        return Map.of(
                "accepted", accepted,
                "account", account,
                "resetUserId", claimedUserId,
                "trainingWeakness", "Parameter tampering can override identity verification"
        );
    }

    @GetMapping("/weak-hash")
    public Map<String, String> weakHash(@RequestParam(defaultValue = "case-9091") String value,
                                        @RequestParam(defaultValue = "MD5") String algorithm) {
        return Map.of(
                "algorithm", algorithm,
                "digest", predictionService.weakDigest(value, algorithm),
                "warning", "MD5/SHA-1 are intentionally exposed for detection training"
        );
    }

    @GetMapping("/predictable-code")
    public Map<String, String> predictableCode() {
        return Map.of(
                "code", predictionService.predictableCode(),
                "source", "java.util.Random seeded generator"
        );
    }

    @GetMapping("/redirect")
    public void redirect(@RequestParam String next, HttpServletResponse response) throws Exception {
        log.info("Redirecting analyst workflow to {}", next);
        response.sendRedirect(next);
    }

    @PostMapping(value = "/deserialize", consumes = MediaType.TEXT_PLAIN_VALUE)
    public Map<String, Object> deserialize(@RequestBody String base64Object) throws Exception {
        byte[] bytes = Base64.getDecoder().decode(base64Object);
        try (ObjectInputStream objectInputStream = new ObjectInputStream(new ByteArrayInputStream(bytes))) {
            Object object = objectInputStream.readObject();
            return Map.of(
                    "type", object.getClass().getName(),
                    "value", String.valueOf(object),
                    "trainingWeakness", "Untrusted Java serialization payload was accepted"
            );
        }
    }

    @GetMapping("/debug")
    public Map<String, Object> debug(@RequestParam(defaultValue = "latest") String caseId) {
        return Map.of(
                "caseId", caseId,
                "databaseUrl", "jdbc:postgresql://localhost:5432/cyber_predict",
                "serviceToken", "debug-token-localhost-9091",
                "stackTracePolicy", "server.error.include-stacktrace=always",
                "actuatorExposure", "management.endpoints.web.exposure.include=*"
        );
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> body) {
        String username = body.getOrDefault("username", "anonymous");
        String password = body.getOrDefault("password", "");
        boolean success = "operator".equals(username) && "ocean-blue-9091".equals(password);
        log.info("login username={} password={} success={}", username, password, success);
        return Map.of(
                "success", success,
                "username", username,
                "rateLimit", "none",
                "monitoring", "no correlation id or alert counter"
        );
    }
}
