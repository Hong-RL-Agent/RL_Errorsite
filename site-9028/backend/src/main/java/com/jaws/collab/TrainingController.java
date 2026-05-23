package com.jaws.collab;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/training")
public class TrainingController {

    // [치명적 결함] 멀티스레드 환경에서 안전하지 않은 일반 int를 사용함
    private static int totalTrainingCount = 0;

    @GetMapping("/status")
    public Map<String, Object> getStatus() {
        return Map.of("totalTasks", totalTrainingCount, "gpuUsage", "88%", "activeModels", 4);
    }

    @PostMapping("/start")
    public Map<String, Object> startTraining() {
        // [오류 포인트] 동기화 없이 값을 증가시킴 (Race Condition 발생)
        // 수백 개의 에이전트가 동시에 호출하면 일부 숫자가 누락됨
        int current = totalTrainingCount;
        try { Thread.sleep(10); } catch (Exception e) {} // 충돌 확률을 높이기 위한 인위적 지연
        totalTrainingCount = current + 1;

        return Map.of("status", "STARTED", "currentCount", totalTrainingCount);
    }

    @PostMapping("/reset")
    public void reset() { totalTrainingCount = 0; }
}