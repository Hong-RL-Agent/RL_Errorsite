package com.site9031.faults.service;

import com.site9031.faults.model.FaultDefinition;
import com.site9031.faults.model.MetricPoint;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class FaultSimulationService {

    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm:ss");

    private final Map<Integer, FaultDefinition> faults = new ConcurrentHashMap<>();

    public FaultSimulationService() {
        faults.put(36, new FaultDefinition(36, "ai-worker-zombie", "AI 워커 좀비화 (PID 고갈 시뮬레이션)",
                "Orchestrator가 워커 회수를 못 해 PID 풀 고갈 위험이 증가합니다.", "critical", false));
        faults.put(33, new FaultDefinition(33, "inode-exhaustion", "Inode 고갈 (파일 생성 불가 상황)",
                "디스크 용량은 남아도 inode 부족으로 신규 파일 생성이 실패합니다.", "high", false));
        faults.put(30, new FaultDefinition(30, "fd-leak", "File Descriptor 누수",
                "열린 소켓/파일 핸들이 누적되어 서비스가 점진적으로 불안정해집니다.", "critical", false));
        faults.put(35, new FaultDefinition(35, "ssd-io-latency", "SSD I/O 지연 (Wait time 증가)",
                "I/O wait 급증으로 API 응답 지연과 큐 적체가 발생합니다.", "high", false));
    }

    public List<FaultDefinition> getFaults() {
        return faults.values().stream()
                .sorted((a, b) -> Integer.compare(a.index(), b.index()))
                .toList();
    }

    public FaultDefinition setFaultEnabled(int index, boolean enabled) {
        FaultDefinition current = faults.get(index);
        if (current == null) {
            throw new IllegalArgumentException("Unsupported fault index: " + index);
        }
        FaultDefinition updated = new FaultDefinition(
                current.index(),
                current.key(),
                current.title(),
                current.symptom(),
                current.severity(),
                enabled
        );
        faults.put(index, updated);
        return updated;
    }

    public List<MetricPoint> getMetricsSnapshot() {
        boolean zombie = isEnabled(36);
        boolean inode = isEnabled(33);
        boolean fdLeak = isEnabled(30);
        boolean ioDelay = isEnabled(35);

        List<MetricPoint> points = new ArrayList<>();
        LocalTime base = LocalTime.now().minusMinutes(11);

        for (int i = 0; i < 12; i++) {
            double wave = Math.sin(i / 2.0) * 4.5;

            double cpu = 34 + wave + (zombie ? 14 : 0) + (ioDelay ? 5 : 0);
            double memory = 46 + (i * 0.8) + (fdLeak ? i * 0.9 : 0);
            double ioWait = 6 + (ioDelay ? 16 + i * 0.9 : i * 0.3);
            double fdUsage = 18 + (fdLeak ? i * 4.2 : i * 1.1);
            double inodeUsage = 42 + (inode ? i * 3.5 : i * 0.7);
            double zombieWorkers = zombie ? 7 + i * 2.1 : Math.max(0, 1 + Math.sin(i));

            points.add(new MetricPoint(
                    base.plusMinutes(i).format(TIME_FORMAT),
                    clamp(cpu, 5, 99),
                    clamp(memory, 10, 99),
                    clamp(ioWait, 1, 98),
                    clamp(fdUsage, 5, 99),
                    clamp(inodeUsage, 5, 99),
                    clamp(zombieWorkers, 0, 99)
            ));
        }
        return points;
    }

    public Map<String, Object> getKpiSummary() {
        List<MetricPoint> metrics = getMetricsSnapshot();
        MetricPoint latest = metrics.get(metrics.size() - 1);

        return Map.of(
                "cpuPressure", latest.cpu(),
                "memoryPressure", latest.memory(),
                "ioWait", latest.ioWait(),
                "fdUsage", latest.fdUsage(),
                "inodeUsage", latest.inodeUsage(),
                "zombieWorkers", latest.zombieWorkers(),
                "faultCount", getFaults().stream().filter(FaultDefinition::enabled).count()
        );
    }

    private boolean isEnabled(int index) {
        FaultDefinition definition = faults.get(index);
        return definition != null && definition.enabled();
    }

    private static double clamp(double value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }
}
