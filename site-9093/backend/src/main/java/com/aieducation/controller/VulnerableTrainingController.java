package com.aieducation.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.net.URI;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
@RequestMapping("/api/lab")
public class VulnerableTrainingController {
    private final TemplateEngine templateEngine;
    private final AtomicInteger sequentialUid = new AtomicInteger(1000);

    public VulnerableTrainingController(TemplateEngine templateEngine) {
        this.templateEngine = templateEngine;
    }

    @PostMapping("/report/render")
    public Map<String, Object> renderReport(@RequestBody Map<String, String> request) {
        String learnerPrompt = request.getOrDefault("template", "AI-EDUCATION report for [[${student}]]");
        Context context = new Context();
        context.setVariable("student", request.getOrDefault("student", "trainee"));
        String rendered = templateEngine.process(learnerPrompt, context);
        return scenario("SSTI-01", rendered, "사용자 입력 템플릿을 서버가 그대로 평가합니다.");
    }

    @GetMapping("/hpp/grade")
    public Map<String, Object> pollutedGrade(@RequestParam Map<String, String> params,
                                             @RequestParam(name = "role", required = false) List<String> roles) {
        String effectiveRole = roles == null || roles.isEmpty() ? "student" : roles.get(roles.size() - 1);
        boolean privileged = "instructor".equalsIgnoreCase(effectiveRole) || "admin".equalsIgnoreCase(effectiveRole);
        Map<String, Object> result = scenario("HPP-02", privileged ? "grade_override_allowed" : "student_view", "중복 role 파라미터의 마지막 값을 신뢰합니다.");
        result.put("allParams", params);
        result.put("roles", roles);
        return result;
    }

    @GetMapping("/crlf/export")
    public ResponseEntity<Map<String, Object>> crlfExport(@RequestParam(defaultValue = "cohort-report.csv") String filename) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-Report-Name", filename);
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"");
        return ResponseEntity.ok()
                .headers(headers)
                .body(scenario("CRLF-03", filename, "응답 헤더에 파일명을 정규화 없이 반영합니다."));
    }

    @GetMapping("/dns/internal-metadata")
    public Map<String, Object> dnsRebinding(HttpServletRequest request,
                                            @RequestHeader(value = "Host", required = false) String host) {
        boolean trusted = host != null && (host.contains("localhost") || host.contains("127.0.0.1"));
        Map<String, Object> result = scenario("DNS-04", trusted ? "internal_metadata_open" : "limited", "Host 헤더만으로 내부 접근을 신뢰합니다.");
        result.put("host", host);
        result.put("remoteAddr", request.getRemoteAddr());
        result.put("metadata", trusted ? Map.of("cacheToken", "training-cache-9093", "internalOnly", true) : Map.of());
        return result;
    }

    @GetMapping("/cache/course")
    public ResponseEntity<Map<String, Object>> cachePoison(@RequestHeader(value = "X-Forwarded-Host", defaultValue = "localhost:9093") String forwardedHost,
                                                           @RequestParam(defaultValue = "logic-flaws") String course) {
        Map<String, Object> body = scenario("CACHE-05", "https://" + forwardedHost + "/course/" + course, "신뢰되지 않은 헤더가 캐시 가능한 응답 본문에 저장됩니다.");
        body.put("course", course);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(java.time.Duration.ofMinutes(10)).cachePublic().noTransform())
                .header("X-Cache-Key", course + "::" + forwardedHost)
                .body(body);
    }

    @PostMapping("/graphql")
    public Map<String, Object> graphql(@RequestBody Map<String, String> body) {
        String query = body.getOrDefault("query", "");
        if (query.contains("__schema") || query.contains("IntrospectionQuery")) {
            return scenario("GQL-06", Map.of(
                    "types", List.of("Learner", "Instructor", "PaymentRecord", "SecurityLog", "InternalCacheEntry"),
                    "queries", List.of("learner(uid)", "allUsers", "securityLogs", "cacheEntries")
            ), "스키마 전체 정보를 요청자 검증 없이 반환합니다.");
        }
        return scenario("GQL-06", Map.of("data", Map.of("course", "PPO Security Curriculum")), "GraphQL 스타일 엔드포인트입니다.");
    }

    @PostMapping("/password/register")
    public Map<String, Object> weakPassword(@RequestBody Map<String, String> body) {
        String password = body.getOrDefault("password", "");
        boolean accepted = password.matches("\\d{4,6}");
        return scenario("PWD-07", accepted ? "accepted" : "rejected", "숫자 4~6자리만 허용하는 취약한 복잡도 정책입니다.");
    }

    @PostMapping("/captcha/verify")
    public Map<String, Object> captcha(@RequestBody Map<String, String> body) {
        boolean accepted = "42".equals(body.getOrDefault("answer", ""));
        return scenario("BOT-08", accepted ? "bot_can_pass" : "failed", "정적 CAPTCHA 답변을 반복 사용합니다.");
    }

    @PostMapping("/notify/send")
    public Map<String, Object> spoofing(@RequestBody Map<String, String> body) {
        Map<String, Object> result = scenario("SPOOF-09", "queued", "발신자 도메인, 번호 소유권, 서명 검증 없이 큐에 넣습니다.");
        result.put("from", body.getOrDefault("from", "mentor@ai-education.local"));
        result.put("to", body.getOrDefault("to", "student@example.com"));
        result.put("channel", body.getOrDefault("channel", "email"));
        return result;
    }

    @PostMapping("/users/create")
    public Map<String, Object> predictableUid(@RequestBody Map<String, String> body) {
        Map<String, Object> user = new HashMap<>();
        user.put("uid", sequentialUid.incrementAndGet());
        user.put("name", body.getOrDefault("name", "new learner"));
        user.put("createdAt", Instant.now().toString());
        return scenario("UID-10", user, "UID가 단순 증가 숫자로 생성됩니다.");
    }

    @GetMapping("/redirect/material")
    public ResponseEntity<Void> weakRedirect(@RequestParam(defaultValue = "http://localhost:9093/materials") String next) {
        return ResponseEntity.status(302)
                .location(URI.create(next))
                .header("X-Training-Scenario", "logic-open-redirect-supporting-signal")
                .build();
    }

    private Map<String, Object> scenario(String id, Object result, String note) {
        Map<String, Object> response = new HashMap<>();
        response.put("scenario", id);
        response.put("result", result);
        response.put("note", note);
        response.put("baseUrl", "http://localhost:9093");
        response.put("timestamp", Instant.now().toString());
        return response;
    }
}
