package com.jaws.audit;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/audit")
public class AuditController {
    
    private boolean isTrialMode = false;

    @GetMapping("/logs")
    public List<Map<String, String>> getLogs(@RequestParam String companyId) {
        List<Map<String, String>> allLogs = new ArrayList<>();
        // 우리 회사 로그
        allLogs.add(Map.of("id", "101", "companyId", "JAWS-LAB", "action", "Admin_Login", "user", "Haeun", "ip", "192.168.0.1"));
        allLogs.add(Map.of("id", "102", "companyId", "JAWS-LAB", "action", "Data_Export", "user", "Jina", "ip", "192.168.0.5"));
        // 타사 로그 (원래는 보이면 안 됨)
        allLogs.add(Map.of("id", "999", "companyId", "SECRET-CORP", "action", "DB_Delete", "user", "Unknown_Attacker", "ip", "45.11.22.33"));

        // [함정] Trial 모드 활성화 시 전체 로그 스트림을 개방해버리는 보안 결함
        if (isTrialMode) {
            return allLogs; 
        }

        return allLogs.stream()
                .filter(log -> log.get("companyId").equals(companyId))
                .toList();
    }

    @PostMapping("/toggle-trial")
    public Map<String, Object> toggleTrial() {
        this.isTrialMode = !this.isTrialMode;
        return Map.of("trialActive", isTrialMode, "message", "엔터프라이즈 체험판 상태가 변경되었습니다.");
    }
}