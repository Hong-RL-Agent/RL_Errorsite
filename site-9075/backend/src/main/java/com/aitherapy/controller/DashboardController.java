package com.aitherapy.controller;

import com.aitherapy.model.Counselor;
import com.aitherapy.model.SecurityFinding;
import com.aitherapy.model.SessionNote;
import com.aitherapy.service.DemoDataService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class DashboardController {
    private final DemoDataService data;

    public DashboardController(DemoDataService data) {
        this.data = data;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of(
                "service", "AI-THERAPY",
                "port", 9075,
                "baseUrl", "http://localhost:9075",
                "labMode", true,
                "checkedAt", Instant.now().toString()
        );
    }

    @GetMapping("/sessions")
    public List<SessionNote> sessions() {
        return data.notes();
    }

    @GetMapping("/counselors")
    public List<Counselor> counselors() {
        return data.counselors();
    }

    @GetMapping("/security/findings")
    public List<SecurityFinding> findings() {
        return data.findings();
    }
}
