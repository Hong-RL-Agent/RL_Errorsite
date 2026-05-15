package com.smarthomesec.api.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;

@RestController
@RequestMapping("/api/training")
public class VulnerableTrainingController {
    private static final Logger log = LoggerFactory.getLogger(VulnerableTrainingController.class);

    @Value("${smart-home-sec.storage-root:./storage}")
    private String storageRoot;

    @PostMapping("/oauth/callback")
    public Map<String, Object> oauthCallback(@RequestBody Map<String, String> payload) {
        log.warn("[SIM-VULN-07] OAuth callback accepted without state validation: provider={}", payload.get("provider"));
        return Map.of(
                "accepted", true,
                "issue", "state parameter was not validated",
                "user", "social-user@smart-home-sec.local"
        );
    }

    @PostMapping("/jwt/verify")
    public Map<String, Object> verifyJwt(@RequestBody Map<String, String> payload) {
        String token = payload.getOrDefault("token", "");
        String alg = "unknown";
        try {
            String[] parts = token.split("\\.");
            if (parts.length > 0) {
                String header = new String(Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8);
                if (header.contains("\"alg\":\"none\"") || header.contains("\"alg\": \"none\"")) {
                    alg = "none";
                }
            }
        } catch (IllegalArgumentException ignored) {
            alg = "malformed";
        }
        boolean accepted = "none".equals(alg);
        log.warn("[SIM-VULN-08] JWT verifier result: alg={}, accepted={}", alg, accepted);
        return Map.of("accepted", accepted, "algorithm", alg, "warning", "training verifier accepts alg=none");
    }

    @PostMapping("/upload")
    public Map<String, Object> upload(@RequestParam("file") MultipartFile file) throws IOException {
        Path captureDir = Path.of(storageRoot, "captures");
        Files.createDirectories(captureDir);
        Path target = captureDir.resolve(file.getOriginalFilename() == null ? "capture.bin" : file.getOriginalFilename());
        Files.write(target, file.getBytes());
        log.warn("[SIM-VULN-10] Uploaded file without trustworthy server-side extension/content validation: {}", target);
        return Map.of("stored", target.toString(), "size", file.getSize(), "contentType", String.valueOf(file.getContentType()));
    }

    @GetMapping("/download")
    public ResponseEntity<byte[]> download(@RequestParam(defaultValue = "latest-system-snapshot.txt") String name) throws IOException {
        Path downloadRoot = Path.of(storageRoot, "downloads");
        Files.createDirectories(downloadRoot);
        Path target = downloadRoot.resolve(name);
        if (!Files.exists(target)) {
            Files.writeString(target, "SMART-HOME-SEC training snapshot " + Instant.now());
        }
        byte[] body = Files.readAllBytes(target);
        log.warn("[SIM-VULN-11] Download followed caller-controlled path and may allow symlink traversal: {}", target);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(target.getFileName().toString()).build().toString())
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(body);
    }

    @PostMapping("/fingerprint")
    public Map<String, Object> fingerprint(@RequestBody Map<String, Object> clientSignals, HttpServletRequest request) {
        log.warn("[SIM-VULN-06] Device fingerprint collected without explicit consent from {}", request.getRemoteAddr());
        return Map.of(
                "remoteAddress", request.getRemoteAddr(),
                "userAgent", request.getHeader("User-Agent"),
                "clientSignals", clientSignals,
                "consent", false
        );
    }
}
