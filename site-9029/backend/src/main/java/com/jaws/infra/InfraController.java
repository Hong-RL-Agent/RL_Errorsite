package com.jaws.infra;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/infra")
public class InfraController { // 파일 이름과 똑같이 InfraController여야 합니다!

    @GetMapping("/secrets")
    public Map<String, String> getSecrets(@RequestParam String user, @RequestParam String pw) {
        if ("admin".equals(user) && "password".equals(pw)) {
            return Map.of("DB_PASSWORD", "jaws_master_1234", "SERVER_IP", "172.18.0.5");
        }
        return Map.of("error", "Unauthorized");
    }

    @GetMapping("/debug-crash")
    public void debugCrash() {
        throw new RuntimeException("Critical Infrastructure Failure at /app/config/server.yaml");
    }
}