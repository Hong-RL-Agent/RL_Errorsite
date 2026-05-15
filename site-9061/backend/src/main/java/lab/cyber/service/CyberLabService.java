package lab.cyber.service;

import lab.cyber.config.CyberLabProperties;
import lab.cyber.model.DefensePosture;
import lab.cyber.model.LabLog;
import lab.cyber.model.LabMetrics;
import lab.cyber.model.ScenarioState;
import lab.cyber.model.StatusResponse;
import org.springframework.stereotype.Service;

import java.io.BufferedOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.lang.management.ManagementFactory;
import java.lang.management.OperatingSystemMXBean;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;

@Service
public class CyberLabService {
    private static final int SERIES_LIMIT = 48;
    private static final int LOG_LIMIT = 80;
    private static final Duration SCENARIO_ACTIVE_WINDOW = Duration.ofSeconds(18);

    private final Random random = new Random();
    private final OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
    private final Path runtimeDir;
    private final ExecutorService workers = Executors.newFixedThreadPool(4);
    private final AtomicReference<DefensePosture> defense = new AtomicReference<>(DefensePosture.defaults());
    private final Map<String, Instant> scenarioTriggers = new ConcurrentHashMap<>();
    private final ArrayDeque<LabLog> logs = new ArrayDeque<>();
    private final ArrayDeque<Double> cpuSeries = new ArrayDeque<>();
    private final ArrayDeque<Double> memorySeries = new ArrayDeque<>();
    private final ArrayDeque<Double> ioSeries = new ArrayDeque<>();
    private final AtomicBoolean cStateDelay = new AtomicBoolean(false);
    private final AtomicBoolean coreSamplerOnline = new AtomicBoolean(true);
    private final Object lockupMonitor = new Object();
    private volatile List<byte[]> memoryPressure = List.of();
    private volatile OutputStream ghostStream;

    public CyberLabService(CyberLabProperties properties) throws IOException {
        this.runtimeDir = Path.of(properties.getRuntimeDir());
        Files.createDirectories(runtimeDir);
        addLog("INFO", "core", "CYBER-LAB telemetry grid initialized");
    }

    public StatusResponse status() {
        maybeWakeDelay();
        synchronized (lockupMonitor) {
            return new StatusResponse(metrics(), defense.get(), scenarioStates(), recentLogs());
        }
    }

    public DefensePosture updateDefense(DefensePosture posture) {
        DefensePosture normalized = new DefensePosture(
                posture.mode() == null ? "WATCH" : posture.mode().toUpperCase(Locale.ROOT),
                clamp(posture.packetInspection(), 0, 100),
                clamp(posture.quarantineLevel(), 0, 100),
                posture.autoContainment(),
                posture.silentBreakerProbe()
        );
        defense.set(normalized);
        addLog("INFO", "defense", "posture set to " + normalized.mode());
        return normalized;
    }

    public Object trigger(String id) {
        scenarioTriggers.put(id, Instant.now());
        addLog("WARN", "scenario", "trigger accepted: " + id);
        return switch (id) {
            case "cpu-quota" -> cpuQuota();
            case "memory-jitter" -> memoryJitter();
            case "ghost-file" -> ghostFile();
            case "steal-time" -> stealTime();
            case "c-state-delay" -> cStateDelay();
            case "dirty-page-writeback" -> dirtyPageWriteback();
            case "bad-process-manager" -> badProcessManager();
            case "hard-lockup" -> hardLockup();
            case "journal-wait" -> journalWait();
            case "fragmentation-stall" -> fragmentationStall();
            case "silent-circuit-breaker" -> silentCircuitBreaker();
            default -> Map.of("error", "unknown scenario");
        };
    }

    public Map<String, Object> dependencyProbe() {
        if (defense.get().silentBreakerProbe() || isActive("silent-circuit-breaker")) {
            addLog("ERROR", "breaker", "dependency failure masked by silent circuit breaker");
            return Map.of();
        }
        return Map.of("status", "ok", "dependency", "training-feed");
    }

    private Map<String, Object> cpuQuota() {
        CompletableFuture.runAsync(() -> boundedSpin(Duration.ofSeconds(5)), workers);
        return Map.of("status", "throttling-window-open", "containerCpuQuota", "0.35");
    }

    private Map<String, Object> memoryJitter() {
        CompletableFuture.runAsync(() -> {
            for (int i = 0; i < 6; i++) {
                memoryPressure = allocateBlocks(8, 1024 * 1024);
                sleep(260);
                memoryPressure = List.of();
                sleep(220);
            }
            addLog("INFO", "memory", "ballooning jitter window closed");
        }, workers);
        return Map.of("status", "memory-jitter-running", "maxBytes", 8 * 1024 * 1024);
    }

    private Map<String, Object> ghostFile() {
        try {
            Path file = runtimeDir.resolve("ghost-training.log");
            ghostStream = new BufferedOutputStream(Files.newOutputStream(file));
            ghostStream.write(new byte[2 * 1024 * 1024]);
            ghostStream.flush();
            addLog("ERROR", "filesystem", "log deleted marker set while stream remains open: " + file.getFileName());
            return Map.of("status", "ghost-handle-open", "file", file.toString());
        } catch (IOException e) {
            addLog("ERROR", "filesystem", "ghost handle setup failed: " + e.getMessage());
            return Map.of("status", "failed");
        }
    }

    private Map<String, Object> stealTime() {
        for (int i = 0; i < 3; i++) {
            CompletableFuture.runAsync(() -> boundedSpin(Duration.ofSeconds(6)), workers);
        }
        return Map.of("status", "steal-workers-running", "workers", 3);
    }

    private Map<String, Object> cStateDelay() {
        cStateDelay.set(true);
        CompletableFuture.runAsync(() -> {
            sleep(14000);
            cStateDelay.set(false);
            addLog("INFO", "latency", "c-state delay shim expired");
        }, workers);
        return Map.of("status", "wake-delay-enabled", "delayMs", "10-20");
    }

    private Map<String, Object> dirtyPageWriteback() {
        CompletableFuture.runAsync(() -> {
            Path file = runtimeDir.resolve("dirty-page-writeback.bin");
            byte[] chunk = new byte[1024 * 1024];
            try (OutputStream out = new BufferedOutputStream(Files.newOutputStream(file))) {
                for (int i = 0; i < 24; i++) {
                    out.write(chunk);
                    if (i % 4 == 0) {
                        out.flush();
                        sleep(180);
                    }
                }
            } catch (IOException e) {
                addLog("ERROR", "io", "dirty page writeback failed: " + e.getMessage());
            }
        }, workers);
        return Map.of("status", "writeback-pressure-running", "mb", 24);
    }

    private Map<String, Object> badProcessManager() {
        coreSamplerOnline.set(false);
        CompletableFuture.runAsync(() -> {
            sleep(9000);
            coreSamplerOnline.set(true);
            addLog("INFO", "supervisor", "core sampler restored");
        }, workers);
        addLog("ERROR", "supervisor", "memory threshold handler stopped core sampler first");
        return Map.of("status", "core-sampler-offline");
    }

    private Map<String, Object> hardLockup() {
        synchronized (lockupMonitor) {
            sleep(1500);
        }
        addLog("ERROR", "kernel", "hard lockup window released after 1500 ms");
        return Map.of("status", "lockup-released", "heldMs", 1500);
    }

    private Map<String, Object> journalWait() {
        sleep(650);
        addLog("WARN", "filesystem", "journal integrity wait inflated I/O latency");
        return Map.of("status", "journal-wait-complete", "waitMs", 650);
    }

    private Map<String, Object> fragmentationStall() {
        CompletableFuture.runAsync(() -> {
            List<byte[]> fragments = allocateBlocks(14, 768 * 1024);
            sleep(350);
            fragments.clear();
            System.gc();
            boundedSpin(Duration.ofMillis(700));
            addLog("WARN", "memory", "fragmentation cleanup stall observed");
        }, workers);
        return Map.of("status", "fragmentation-cleanup-running");
    }

    private Map<String, Object> silentCircuitBreaker() {
        addLog("ERROR", "breaker", "upstream exception swallowed; returning HTTP 200 empty JSON");
        return Map.of();
    }

    private LabMetrics metrics() {
        double baseCpu = coreSamplerOnline.get() ? systemLoad() : 0.0;
        double cpu = clampDouble(baseCpu * 100 + activeBoost("steal-time", 32) + activeBoost("cpu-quota", 38)
                + activeBoost("fragmentation-stall", 24), 4, 99);
        double memory = clampDouble(48 + memoryPressure.size() * 3.5 + activeBoost("memory-jitter", random.nextDouble(22)), 18, 96);
        double ioWait = clampDouble(6 + activeBoost("dirty-page-writeback", 35) + activeBoost("journal-wait", 44)
                + activeBoost("ghost-file", 12) + random.nextDouble(8), 0, 90);
        double latency = clampDouble(38 + cpu * 0.7 + ioWait * 1.8 + activeBoost("hard-lockup", 900)
                + activeBoost("c-state-delay", 18) + random.nextDouble(30), 20, 1900);
        double packetRate = clampDouble(500 + random.nextDouble(900) - ioWait * 4, 120, 1400);
        double jitter = clampDouble(random.nextDouble(18) + activeBoost("memory-jitter", 42)
                + activeBoost("c-state-delay", 16), 0, 100);

        push(cpuSeries, cpu);
        push(memorySeries, memory);
        push(ioSeries, ioWait);
        return new LabMetrics(Instant.now(), round(cpu), round(memory), round(ioWait), round(latency),
                round(packetRate), round(jitter), List.copyOf(cpuSeries), List.copyOf(memorySeries), List.copyOf(ioSeries));
    }

    private List<ScenarioState> scenarioStates() {
        Instant now = Instant.now();
        return ScenarioCatalog.ENTRIES.stream()
                .map(entry -> {
                    Instant triggered = scenarioTriggers.get(entry.id());
                    String status = triggered != null && Duration.between(triggered, now).compareTo(SCENARIO_ACTIVE_WINDOW) < 0
                            ? "ACTIVE" : "ARMED";
                    return new ScenarioState(entry.id(), entry.name(), status, triggered, entry.signal());
                })
                .toList();
    }

    private void maybeWakeDelay() {
        if (cStateDelay.get()) {
            sleep(10 + random.nextInt(11));
        }
    }

    private boolean isActive(String id) {
        Instant triggered = scenarioTriggers.get(id);
        return triggered != null && Duration.between(triggered, Instant.now()).compareTo(SCENARIO_ACTIVE_WINDOW) < 0;
    }

    private double activeBoost(String id, double amount) {
        return isActive(id) ? amount : 0;
    }

    private double systemLoad() {
        double load = osBean.getSystemLoadAverage();
        int cores = Math.max(1, osBean.getAvailableProcessors());
        if (load < 0) {
            return 0.15 + random.nextDouble(0.25);
        }
        return Math.min(1.0, load / cores);
    }

    private void boundedSpin(Duration duration) {
        long until = System.nanoTime() + duration.toNanos();
        double sink = 0;
        while (System.nanoTime() < until) {
            sink += Math.sqrt(random.nextDouble() + sink);
            if (sink > 1_000_000) {
                sink = 0;
            }
        }
    }

    private List<byte[]> allocateBlocks(int count, int size) {
        List<byte[]> blocks = new ArrayList<>(count);
        for (int i = 0; i < count; i++) {
            byte[] block = new byte[size];
            block[0] = (byte) i;
            blocks.add(block);
        }
        return blocks;
    }

    private synchronized void addLog(String severity, String source, String message) {
        logs.addFirst(new LabLog(Instant.now(), severity, source, message));
        while (logs.size() > LOG_LIMIT) {
            logs.removeLast();
        }
    }

    private synchronized List<LabLog> recentLogs() {
        return List.copyOf(logs);
    }

    private void push(ArrayDeque<Double> series, double value) {
        series.addLast(round(value));
        while (series.size() > SERIES_LIMIT) {
            series.removeFirst();
        }
    }

    private void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }

    private double clampDouble(double value, double min, double max) {
        return Math.max(min, Math.min(max, value));
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
