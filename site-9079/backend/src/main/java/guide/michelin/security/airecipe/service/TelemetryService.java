package guide.michelin.security.airecipe.service;

import guide.michelin.security.airecipe.model.SystemSnapshot;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class TelemetryService {
    private final VirtualMemoryEngine memoryEngine;
    private final AtomicInteger tick = new AtomicInteger(0);

    public TelemetryService(VirtualMemoryEngine memoryEngine) {
        this.memoryEngine = memoryEngine;
    }

    public SystemSnapshot snapshot() {
        int t = tick.incrementAndGet();
        int availability = 93 + wave(t, 5);
        int heapPressure = 41 + wave(t + 2, 17);
        int integrity = 88 - Math.max(0, wave(t + 4, 11));
        int transitions = 4 + Math.abs(wave(t + 1, 8));

        Map<String, Integer> load = new LinkedHashMap<>();
        load.put("flavor-embedding", 72 + wave(t, 9));
        load.put("molecular-sim", 64 + wave(t + 1, 12));
        load.put("memory-engine", 58 + wave(t + 2, 15));
        load.put("risk-classifier", 69 + wave(t + 3, 10));

        return new SystemSnapshot(
                Instant.now(),
                clamp(availability),
                clamp(heapPressure),
                clamp(integrity),
                transitions,
                memoryEngine.catalog(),
                logs(t),
                load
        );
    }

    private List<String> logs(int t) {
        return List.of(
                stamp(t) + " recipe-kernel booted in training-only mode",
                stamp(t + 1) + " denied backdoor probe: inert route telemetry emitted",
                stamp(t + 2) + " virtual heap page spray density sampled",
                stamp(t + 3) + " parser anomaly classified as memory-corruption simulation",
                stamp(t + 4) + " ROP gadget graph blocked by policy model"
        );
    }

    private String stamp(int offset) {
        return "T+" + String.format("%04d", offset);
    }

    private int wave(int seed, int amplitude) {
        return (int) Math.round(Math.sin(seed / 2.0) * amplitude);
    }

    private int clamp(int value) {
        return Math.max(0, Math.min(100, value));
    }
}

