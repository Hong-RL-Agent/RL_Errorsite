package ai.trans.policylab.controller;

import ai.trans.policylab.model.PolicyLogEntry;
import ai.trans.policylab.model.TranslationRequest;
import ai.trans.policylab.model.TranslationResponse;
import ai.trans.policylab.service.PolicyLogService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class PolicyController {
    private final PolicyLogService policyLogService;

    public PolicyController(PolicyLogService policyLogService) {
        this.policyLogService = policyLogService;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok", "origin", "http://localhost:9087");
    }

    @PostMapping("/translate")
    public TranslationResponse translate(@RequestBody TranslationRequest request) {
        String input = request.text() == null ? "" : request.text();
        String translated = "[AI-TRANS:%s] %s".formatted(request.targetLanguage(), input)
                .replace("security", "보안")
                .replace("network", "네트워크")
                .replace("browser", "브라우저");
        policyLogService.record("translate", "Translated %d chars from %s to %s"
                .formatted(input.length(), request.sourceLanguage(), request.targetLanguage()));
        return new TranslationResponse(request.sourceLanguage(), request.targetLanguage(), translated, 0.87);
    }

    @GetMapping("/policy/logs")
    public List<PolicyLogEntry> logs() {
        return policyLogService.latest();
    }

    @PostMapping("/policy/client-event")
    public PolicyLogEntry clientEvent(@RequestBody Map<String, String> event) {
        return policyLogService.record(event.getOrDefault("channel", "client"),
                event.getOrDefault("message", "browser event without message"));
    }

    @PostMapping("/policy/preflight")
    public ResponseEntity<Map<String, String>> preflight(@RequestHeader Map<String, String> headers) {
        policyLogService.record("cors", "Custom-header request processed; header count=" + headers.size());
        return ResponseEntity.ok(Map.of("status", "preflight-latency-simulated"));
    }

    @GetMapping("/session/third-party")
    public Map<String, String> thirdPartySession(HttpServletResponse response) {
        Cookie cookie = new Cookie("AI_TRANS_EDGE_SESSION", "ephemeral-third-party-risk");
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(600);
        cookie.setAttribute("SameSite", "None");
        response.addCookie(cookie);
        policyLogService.record("itp", "Issued SameSite=None session cookie for ITP eviction simulation");
        return Map.of("status", "third-party-session-issued", "risk", "browser-itp-eviction");
    }
}

