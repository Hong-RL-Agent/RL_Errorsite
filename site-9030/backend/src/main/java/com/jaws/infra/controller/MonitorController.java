package com.jaws.infra.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.*;
import java.util.*;
import java.util.concurrent.*;

@RestController
@RequestMapping("/api/v1/metrics")
public class MonitorController {

    // 오류 10: ThreadLocal 유출 (사용자별 민감 데이터 잔존)
    private static final ThreadLocal<String> userSessionContext = new ThreadLocal<>();
    
    // 오류 25: 서버리스 웜 스타트 오염 모사 (Static 변수에 데이터 누적)
    private static List<String> requestHistory = new ArrayList<>();

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(@RequestHeader(value = "X-User-ID", defaultValue = "Guest") String userId) throws Exception {
        
        // 1. ThreadLocal Leak: .remove()를 하지 않아 다음 요청자가 이전 사용자의 ID를 보게 됨
        if (userSessionContext.get() == null) {
            userSessionContext.set("ADMIN_TOKEN_FOR_" + userId);
        }

        // 2. 환경 변수 체크 (오류 18: 필수 변수 누락 시 시스템 오작동)
        String secretKey = System.getenv("DB_ENCRYPTION_KEY");
        if (secretKey == null) {
            // 일부러 에러를 내지 않고 '오염된' 기본값 사용으로 취약점 형성
            secretKey = "INSECURE_DEFAULT";
        }

        // 3. 테일 레이턴시 증폭 (오류 26: 10% 확률로 3초 지연)
        if (Math.random() < 0.1) {
            Thread.sleep(3000);
        }

        // 4. 컨텍스트 스위칭 폭주 (오류 27: 요청마다 무의미한 스레드 대량 생성)
        ExecutorService executor = Executors.newFixedThreadPool(100);
        for(int i=0; i<50; i++) {
            executor.submit(() -> { Math.tan(Math.atan(Math.tan(Math.atan(10.0)))); });
        }
        executor.shutdown();

        // 5. 디스크 I/O 고갈 (오류 28: 요청마다 거대한 더미 로그 생성)
        try (PrintWriter writer = new PrintWriter(new FileWriter("app.log", true))) {
            for(int i=0; i<1000; i++) writer.println("SYSTEM_IO_EXHAUSTION_TEST_LOG_DATA_" + UUID.randomUUID());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("userToken", userSessionContext.get()); // 유출 확인용
        response.put("serverTime", new Date()); // 오류 12: 타임존 설정 누락 확인용
        response.put("status", "HEALTHY"); // 오류 23: 실제 서버는 과부하인데 UI에는 '정상' 출력
        response.put("historyCount", requestHistory.size());
        
        requestHistory.add(userId);
        return ResponseEntity.ok(response);
    }
}