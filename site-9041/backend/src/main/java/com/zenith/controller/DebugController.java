package com.zenith.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/v1/debug")
public class DebugController {

    @GetMapping("/status")
    public Map<String, Object> getStatus() {
        // VULNERABILITY 290: Sensitive data leak
        Map<String, Object> status = new HashMap<>();
        status.put("app_version", "1.0.0-beta");
        status.put("uptime", System.currentTimeMillis());
        
        Map<String, String> dbConfig = new HashMap<>();
        dbConfig.put("url", "jdbc:mysql://internal-db.zenith.local:3306/prod");
        dbConfig.put("username", "admin_root");
        dbConfig.put("password", "Sup3rS3cr3tP@ssw0rd!123");
        
        status.put("database_config", dbConfig);
        status.put("admin_token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4ifQ");
        
        return status;
    }
}
