package com.jaws.infra.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/network")
public class NetworkController {

    @GetMapping("/status")
    public Map<String, Object> getStatus() throws Exception {
        // 1. 패킷 유실 및 타임아웃 모사 (20% 확률로 무한 루프나 지연)
        if (Math.random() < 0.2) {
            Thread.sleep(5000); // Nginx 타임아웃(1s)보다 길게 설정하여 에러 유도
        }

        // 2. 프로토콜 손상 (일부러 HTTP 503 응답 반환)
        if (Math.random() < 0.1) {
            throw new RuntimeException("Service Unavailable (Protocol Corruption)");
        }

        Map<String, Object> res = new HashMap<>();
        res.put("packetLoss", "12.5%");
        res.put("latency", "142ms");
        res.put("protocol", "HTTP/1.1");
        res.put("sslStatus", "EXPIRED"); // Index 32: 인증서 만료 상황 모사
        return res;
    }
}