package com.jaws.infra.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    // Index 72: 파라미터 변조를 통한 타인 프로필 조회
    @GetMapping("/user/profile")
    public Map<String, String> getUserProfile(@RequestParam String id) {
        Map<String, String> profile = new HashMap<>();
        if ("9035".equals(id)) {
            profile.put("username", "Haeun_Admin");
            profile.put("role", "SUPER_USER");
        } else {
            profile.put("username", "Guest_" + id);
            profile.put("role", "READ_ONLY");
            profile.put("leaked_note", "Private data of user " + id);
        }
        return profile;
    }

    // Index 70: 관리자 로그 접근 권한 체크 누락
    @GetMapping("/admin/audit-logs")
    public List<String> getAdminLogs() {
        return Arrays.asList(
            "[CRITICAL] Database credentials accessed by Admin",
            "[SYSTEM] Deployment successful at 9035",
            "[WARN] Potential IDOR attack detected on user 9035"
        );
    }
}