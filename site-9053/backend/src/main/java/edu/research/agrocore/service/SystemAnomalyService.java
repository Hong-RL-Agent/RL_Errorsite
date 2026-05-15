package edu.research.agrocore.service;

import edu.research.agrocore.model.AnomalyStatus;
import edu.research.agrocore.model.FarmTelemetry;
import edu.research.agrocore.model.SystemLogEntry;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Deque;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Semaphore;
import java.util.concurrent.locks.ReentrantLock;

@Service
public class SystemAnomalyService {
    private static final int MAX_LOGS = 240;

    private final boolean defaultEnabled;
    private final Instant boot = Instant.now();
    private final Random random = new Random();
    private final Map<String, AnomalyDefinition> definitions = new LinkedHashMap<>();
    private final Map<String, Boolean> toggles = new ConcurrentHashMap<>();
    private final Deque<SystemLogEntry> logs = new ArrayDeque<>();
    private final ReentrantLock pumpMutex = new ReentrantLock();
    private final Semaphore workqueueSlots = new Semaphore(3);
    private final ExecutorService lowPriorityPool = Executors.newFixedThreadPool(4);
    private final List<byte[]> leakedSlabs = new ArrayList<>();

    public SystemAnomalyService(@Value("${agro-core.anomalies-enabled:true}") boolean defaultEnabled) {
        this.defaultEnabled = defaultEnabled;
        registerDefinitions();
    }

    @PostConstruct
    void startBackgroundNoise() {
        definitions.keySet().forEach(id -> toggles.put(id, defaultEnabled));
        lowPriorityPool.submit(this::simulateLogCollectorPriorityInversion);
        lowPriorityPool.submit(this::simulateWorkqueueStarvation);
        lowPriorityPool.submit(this::simulateSlabLeak);
        log("INFO", "orchestrator", "AGRO-CORE anomaly harness initialized with 11 systemic regression channels");
    }

    public FarmTelemetry telemetry() {
        applyApiJitter();
        double t = Duration.between(boot, Instant.now()).toMillis() / 1000.0;
        double moisture = clamp(62 + Math.sin(t / 11) * 12 - intensity("priority-inversion") * 18, 18, 88);
        double temp = clamp(22.5 + Math.sin(t / 19) * 2.7 + intensity("gpu-scheduler") * 1.2, 17, 34);
        double co2 = clamp(710 + Math.cos(t / 13) * 75 - intensity("timer-drift") * 55, 420, 1200);
        double lux = clamp(34000 + Math.sin(t / 9) * 4200 - intensity("timer-drift") * 2600, 12000, 52000);
        double pump = clamp(4.7 + Math.cos(t / 7) * .5 - intensity("priority-inversion") * 1.1, 1.8, 6.2);

        return new FarmTelemetry(
                Instant.now(),
                driftedFarmClock(),
                moisture,
                temp,
                co2,
                lux,
                pump,
                clamp(58 - intensity("gpu-scheduler") * 31 - intensity("unified-memory") * 19, 7, 60),
                clamp(42 + intensity("hypervisor-steal") * randomRange(50, 500), 20, 560),
                clamp(31 + intensity("slab-leak") * leakedSlabs.size() * .7 + intensity("major-page-fault") * 44, 8, 98),
                clamp(18 + intensity("major-page-fault") * 73 + intensity("negative-dentry") * 22, 4, 99),
                clamp(9 + intensity("unified-memory") * 87, 0, 100),
                clamp(2 + intensity("workqueue-starvation") * 170, 0, 220),
                clamp(7 + intensity("ring-bus-contention") * 79, 0, 100),
                clamp(12 + intensity("numa-remote-flush") * 300, 8, 330),
                anomalies()
        );
    }

    public List<AnomalyStatus> anomalies() {
        return definitions.values().stream()
                .map(def -> new AnomalyStatus(
                        def.id,
                        def.name,
                        def.subsystem,
                        def.severity,
                        enabled(def.id),
                        intensity(def.id),
                        def.signal,
                        def.mitigation))
                .sorted(Comparator.comparing(AnomalyStatus::id))
                .toList();
    }

    public boolean toggle(String id) {
        if (!definitions.containsKey(id)) {
            throw new IllegalArgumentException("Unknown anomaly: " + id);
        }
        boolean enabled = !enabled(id);
        toggles.put(id, enabled);
        log(enabled ? "WARN" : "INFO", "anomaly-control", "%s %s".formatted(id, enabled ? "enabled" : "disabled"));
        return enabled;
    }

    public List<SystemLogEntry> logs() {
        synchronized (logs) {
            ArrayList<SystemLogEntry> snapshot = new ArrayList<>(logs);
            java.util.Collections.reverse(snapshot);
            return snapshot;
        }
    }

    public void runHistoricalAnalysis() {
        if (!enabled("major-page-fault")) {
            log("INFO", "archive-analysis", "Historical data analysis completed from hot cache");
            return;
        }
        allocateTransientPages(64);
        log("WARN", "mm/vmscan", "Major page faults spiked while scanning 9.2 TB harvest history; swap-in latency visible to UI");
    }

    public void runLeafAnalysisTransfer() {
        if (enabled("unified-memory")) {
            sleep(2000);
            log("CRIT", "gpu/pcie", "Unified memory migration saturated PCIe x16 link; 3D leaf-analysis frame stream stalled for 2.0s");
        } else {
            log("INFO", "gpu/pcie", "Leaf-analysis transfer completed within NUMA-local staging buffer");
        }
    }

    public void archiveRemoteFlush() {
        if (enabled("numa-remote-flush")) {
            sleep(300);
            log("WARN", "archive-service", "Remote NUMA dirty page flush delayed archive commit by 300ms");
        } else {
            log("INFO", "archive-service", "Archive commit flushed from local memory node");
        }
    }

    private void simulateLogCollectorPriorityInversion() {
        while (!Thread.currentThread().isInterrupted()) {
            if (enabled("priority-inversion")) {
                pumpMutex.lock();
                try {
                    log("WARN", "log-collector", "Low-priority Log Collector holds pump mutex while soil moisture drops");
                    sleep(650);
                } finally {
                    pumpMutex.unlock();
                }
            }
            sleep(4200);
        }
    }

    private void simulateWorkqueueStarvation() {
        while (!Thread.currentThread().isInterrupted()) {
            if (enabled("workqueue-starvation")) {
                boolean acquired = workqueueSlots.tryAcquire();
                if (acquired) {
                    lowPriorityPool.submit(() -> {
                        try {
                            sleep(1500);
                            log("WARN", "kworker/u16", "Low-priority nutrient reconciliation occupied system workqueue slot");
                        } finally {
                            workqueueSlots.release();
                        }
                    });
                }
            }
            sleep(1800);
        }
    }

    private void simulateSlabLeak() {
        while (!Thread.currentThread().isInterrupted()) {
            if (enabled("slab-leak") && leakedSlabs.size() < 128) {
                leakedSlabs.add(new byte[128 * 1024]);
                log("WARN", "sensor-factory", "Sensor Object Factory retained kmalloc-128 slab cache; unreclaimed objects=%d".formatted(leakedSlabs.size()));
            }
            sleep(5200);
        }
    }

    private void applyApiJitter() {
        if (enabled("hypervisor-steal")) {
            long jitter = Math.round(randomRange(50, 500));
            sleep(jitter);
            if (random.nextDouble() > .68) {
                log("WARN", "hypervisor", "High Hypervisor Steal Time detected from neighboring VM; API jitter=%dms".formatted(jitter));
            }
        }
        if (enabled("negative-dentry") && random.nextDouble() > .75) {
            log("WARN", "vfs/dcache", "Scanned 4096 missing sensor config paths; negative dentry cache bloat increased lookup cost");
        }
        if (enabled("ring-bus-contention") && random.nextDouble() > .82) {
            log("WARN", "ipc-fabric", "Cross-thread IPC burst saturated simulated CPU ring bus; mailbox round-trip latency degraded");
        }
        if (enabled("gpu-scheduler") && random.nextDouble() > .8) {
            log("WARN", "gpu-sched", "AI Plant Growth Simulation launched 8192 micro-kernels; hardware scheduler bottleneck dropped FPS");
        }
    }

    private Instant driftedFarmClock() {
        long minutes = Math.max(1, Duration.between(boot, Instant.now()).toMinutes() + 1);
        long driftMs = enabled("timer-drift") ? minutes * 10 : 0;
        return Instant.now().plusMillis(driftMs);
    }

    private void allocateTransientPages(int mb) {
        List<byte[]> pages = new ArrayList<>();
        for (int i = 0; i < mb; i++) {
            pages.add(new byte[1024 * 1024]);
        }
        sleep(450);
    }

    private boolean enabled(String id) {
        return toggles.getOrDefault(id, defaultEnabled);
    }

    private double intensity(String id) {
        return enabled(id) ? definitions.get(id).intensity : 0.0;
    }

    private void registerDefinitions() {
        add("priority-inversion", "Real-time Priority Inversion", "Water Pump Service", "critical", .92,
                "Pump Control blocked by Log Collector mutex during moisture-drop windows",
                "Priority inheritance mutex and bounded logging queue");
        add("gpu-scheduler", "GPU Hardware Scheduler Bottleneck", "AI Plant Growth Simulation", "warning", .78,
                "Thousands of micro-kernels collapse growth-simulation FPS",
                "Kernel fusion and persistent worker kernels");
        add("timer-drift", "Scheduler Tick Delay & Timer Drift", "Lighting & CO2 Cycle", "warning", .55,
                "Farm clock drifts 10ms/min from wall clock",
                "Monotonic clock reconciliation and cycle resync");
        add("major-page-fault", "Major Page Faults & Disk Bottleneck", "Historical Data Analysis", "critical", .83,
                "Memory-heavy analysis causes swap-in pressure and UI stalls",
                "Windowed reads, mmap limits, and async report jobs");
        add("slab-leak", "Kernel Slab Memory Leak", "Sensor Object Factory", "critical", .68,
                "kmalloc-128-like retained sensor buffers grow over session lifetime",
                "Object lifecycle audit and cache shrinker telemetry");
        add("hypervisor-steal", "Hypervisor Resource Poaching", "Virtualization Layer", "warning", .88,
                "50-500ms API jitter with high steal-time log signatures",
                "Pin critical vCPU set and enforce noisy-neighbor limits");
        add("unified-memory", "GPU Unified Memory Swapping & PCIe Saturation", "3D Leaf Analysis", "critical", .91,
                "CPU/GPU migration saturates PCIe and freezes UI for 2 seconds",
                "Explicit staging buffers and prefetch policy");
        add("workqueue-starvation", "Kernel Workqueue Starvation", "Critical Sensor Interrupts", "critical", .73,
                "Maintenance jobs occupy workqueue ahead of interrupt handling",
                "Dedicated high-priority queue and backpressure");
        add("negative-dentry", "VFS Negative Dentry Cache Bloat", "Sensor Configuration Loader", "warning", .62,
                "Missing config-file probes inflate negative dentry cache",
                "Manifest-based lookup and miss-rate circuit breaker");
        add("ring-bus-contention", "CPU Ring Bus Contention", "IPC Telemetry Fabric", "warning", .7,
                "IPC-heavy threads mimic saturated CPU ring bus latency",
                "Batch mailbox messages and reduce cross-core chatter");
        add("numa-remote-flush", "NUMA Remote Dirty Page Flush Delay", "Archive Service", "warning", .64,
                "Remote-node archive writes incur 300ms dirty-page flush delay",
                "NUMA-aware archive worker placement");
    }

    private void add(String id, String name, String subsystem, String severity, double intensity, String signal, String mitigation) {
        definitions.put(id, new AnomalyDefinition(id, name, subsystem, severity, intensity, signal, mitigation));
    }

    private void log(String level, String subsystem, String message) {
        synchronized (logs) {
            logs.addLast(new SystemLogEntry(Instant.now(), level, subsystem, message));
            while (logs.size() > MAX_LOGS) {
                logs.removeFirst();
            }
        }
    }

    private void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private double randomRange(double min, double max) {
        return min + random.nextDouble() * (max - min);
    }

    private double clamp(double value, double min, double max) {
        return Math.max(min, Math.min(max, value));
    }

    private record AnomalyDefinition(
            String id,
            String name,
            String subsystem,
            String severity,
            double intensity,
            String signal,
            String mitigation
    ) {
    }
}
