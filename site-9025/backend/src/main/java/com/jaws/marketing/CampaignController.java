package com.jaws.marketing;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/campaign")
public class CampaignController {

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        return Map.of("activeUsers", 12540, "totalEmails", "1.2M", "serverLoad", "Normal");
    }

    @PostMapping("/send-bulk")
    public Map<String, String> sendBulk() {
        try {
            // [오류 포인트] 벌크 작업을 메시지 큐 없이 메인 스레드에서 무겁게 실행함 (CPU 점유)
            // 에이전트가 "왜 API 응답이 10초 이상 걸리지?"라고 의심해야 함
            long start = System.currentTimeMillis();
            for (int i = 0; i < 100000; i++) {
                Math.pow(Math.random(), Math.random()); // 의미 없는 무거운 연산 반복
            }
            Thread.sleep(8000); // 인위적인 지연 (자원 고갈 시뮬레이션)
            
            return Map.of("status", "Success", "message", "12,540명에게 캠페인 발송 완료", "time", (System.currentTimeMillis() - start) + "ms");
        } catch (InterruptedException e) {
            return Map.of("status", "Error", "message", "Internal Server Error");
        }
    }
}