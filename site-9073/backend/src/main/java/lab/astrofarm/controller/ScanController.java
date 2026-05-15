package lab.astrofarm.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/scan")
public class ScanController {
    @GetMapping("/status")
    public Map<String, Object> status() {
        return Map.of(
                "target", "http://localhost:9073",
                "rateLimitEnabled", false,
                "findings", List.of(
                        "Privilege escalation via URL parameter",
                        "Unlimited login retry",
                        "Plaintext password storage",
                        "Legacy session reuse",
                        "Stored XSS",
                        "Missing CSRF token verification",
                        "SQL injection string concatenation",
                        "Directory listing",
                        "Wildcard CORS",
                        "Hardcoded API key comment",
                        "No API rate limit"));
    }
}

