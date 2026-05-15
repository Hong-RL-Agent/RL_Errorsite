package lab.skylogistics.service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.locks.ReentrantLock;

import lab.skylogistics.config.StressProperties;
import lab.skylogistics.model.DroneStatus;
import lab.skylogistics.model.FleetSnapshot;
import lab.skylogistics.model.RegressionEvent;
import lab.skylogistics.model.Telemetry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class SystemStressService {
    private static final Logger log = LoggerFactory.getLogger(SystemStressService.class);

    private final StressProperties properties;
    private final SecureRandom random = new SecureRandom();
    private final Map<String, RegressionEvent> events = Collections.synchronizedMap(new LinkedHashMap<>());
    private final List<byte[]> mapTileCache = Collections.synchronizedList(new ArrayList<>());
    private final AtomicLong syntheticLatency = new AtomicLong(42);
    private final AtomicInteger activeWorkers = new AtomicInteger(12);
    private final AtomicInteger dirtyCacheMb = new AtomicInteger();
    private final AtomicInteger contextSwitchRate = new AtomicInteger(1200);
    private final AtomicInteger pidBudget;
    private final ReentrantLock routeSpinlock = new ReentrantLock();
    private final ReentrantLock herdMutex = new ReentrantLock();
    private final ExecutorService workerPool = Executors.newCachedThreadPool();

    public SystemStressService(StressProperties properties) {
        this.properties = properties;
        this.pidBudget = new AtomicInteger(properties.getPidLimit());
        seedEvents();
    }

    public FleetSnapshot snapshot() {
        var telemetry = telemetry();
        var alerts = regressions().stream()
                .filter(event -> !"standby".equals(event.status()))
                .limit(6)
                .toList();
        return new FleetSnapshot(Instant.now(), drones(telemetry), telemetry, alerts);
    }

    public List<RegressionEvent> regressions() {
        synchronized (events) {
            return new ArrayList<>(events.values());
        }
    }

    public Optional<RegressionEvent> trigger(String id) {
        return switch (id) {
            case "interrupt-storm" -> Optional.of(interruptStorm());
            case "kernel-lockup" -> Optional.of(kernelLockup());
            case "cache-bloat" -> Optional.of(cacheBloat());
            case "numa-paradox" -> Optional.of(numaParadox());
            case "pid-limit" -> Optional.of(pidLimit());
            case "journal-delay" -> Optional.of(journalDelay());
            case "gpu-launch-delay" -> Optional.of(gpuLaunchDelay());
            case "pcie-p2p" -> Optional.of(pcieP2p());
            case "bandwidth-saturation" -> Optional.of(bandwidthSaturation());
            case "compaction-storm" -> Optional.of(compactionStorm());
            case "thundering-herd" -> Optional.of(thunderingHerd());
            default -> Optional.empty();
        };
    }

    public void reset() {
        synchronized (events) {
            events.replaceAll((key, event) -> event.reset());
        }
        mapTileCache.clear();
        dirtyCacheMb.set(0);
        syntheticLatency.set(42);
        activeWorkers.set(12);
        contextSwitchRate.set(1200);
        pidBudget.set(properties.getPidLimit());
    }

    private Telemetry telemetry() {
        var active = regressions().stream().filter(event -> !"standby".equals(event.status())).count();
        var cpuSteal = clamp(active * 7.5 + jitter(4), 1, 78);
        var cpuLoad = clamp(32 + active * 6 + jitter(8), 20, 98);
        var memoryPressure = clamp(24 + dirtyCacheMb.get() * 0.24 + active * 4, 10, 98);
        var ioWait = clamp(active * 3 + ("active".equals(events.get("journal-delay").status()) ? 42 : 0), 1, 88);
        var gpuQueue = clamp(("active".equals(events.get("gpu-launch-delay").status()) ? 150 : 18) + jitter(10), 8, 240);
        var p99 = clamp(syntheticLatency.get() + active * 24 + jitter(20), 40, 2100);
        return new Telemetry(cpuLoad, cpuSteal, memoryPressure, ioWait, gpuQueue, p99,
                activeWorkers.get(), dirtyCacheMb.get(), contextSwitchRate.get());
    }

    private List<DroneStatus> drones(Telemetry telemetry) {
        var states = List.of("DELIVERING", "RETURNING", "CHARGING", "HOLDING", "REROUTING");
        var baseLat = 37.5665;
        var baseLon = 126.9780;
        var drones = new ArrayList<DroneStatus>();
        for (int i = 1; i <= 12; i++) {
            var degraded = telemetry.p99LatencyMs() > 300 && i % 4 == 0;
            drones.add(new DroneStatus(
                    "SKY-" + String.format("%03d", i),
                    "SEOUL-" + (char) ('A' + (i % 6)) + i,
                    baseLat + (random.nextDouble() - 0.5) * 0.18,
                    baseLon + (random.nextDouble() - 0.5) * 0.26,
                    Math.max(8, 94 - i * 5 - random.nextInt(8)),
                    degraded ? "REROUTING" : states.get(i % states.size()),
                    degraded ? 61 : 83 + random.nextInt(15),
                    1 + random.nextInt(5)
            ));
        }
        return drones;
    }

    private RegressionEvent interruptStorm() {
        syntheticLatency.addAndGet(180);
        contextSwitchRate.set(24_000 + random.nextInt(10_000));
        return update("interrupt-storm", 380,
                "sensor-bus: overflow generated 41280 virtual IRQ/s; cpu_steal=67%");
    }

    private RegressionEvent kernelLockup() {
        workerPool.submit(() -> {
            routeSpinlock.lock();
            try {
                Thread.sleep(1000);
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
            } finally {
                routeSpinlock.unlock();
            }
        });
        syntheticLatency.addAndGet(1000);
        return update("kernel-lockup", 1000,
                "route-calc: simulated spinlock held for 1000ms without preemption");
    }

    private RegressionEvent cacheBloat() {
        var target = Math.max(16, Math.min(properties.getTileCacheMb(), 256));
        while (dirtyCacheMb.get() < target) {
            mapTileCache.add(new byte[1024 * 1024]);
            dirtyCacheMb.incrementAndGet();
        }
        syntheticLatency.addAndGet(260);
        return update("cache-bloat", 620,
                "map-cache: dirty page growth reached " + dirtyCacheMb.get() + "MiB; direct reclaim active");
    }

    private RegressionEvent numaParadox() {
        sleep(100);
        syntheticLatency.addAndGet(100);
        return update("numa-paradox", 100,
                "regional-data: auto-balancer migrated hot pages across NUMA boundary; +100ms access latency");
    }

    private RegressionEvent pidLimit() {
        var requested = 48;
        var available = pidBudget.getAndUpdate(current -> Math.max(0, current - requested));
        var message = available < requested
                ? "fleet-scale: java.lang.OutOfMemoryError: unable to create native thread; Resource temporarily unavailable"
                : "fleet-scale: consumed " + requested + " PID slots; remaining=" + Math.max(0, available - requested);
        activeWorkers.addAndGet(Math.min(available, requested));
        return update("pid-limit", available < requested ? 410 : 120, message);
    }

    private RegressionEvent journalDelay() {
        workerPool.submit(() -> {
            log.warn("flight-log: journal commit queue saturated; blocking I/O for 2000ms");
            sleep(2000);
        });
        syntheticLatency.addAndGet(420);
        return update("journal-delay", 2000,
                "flight-log: ext4 journal transaction blocked for 2000ms during peak telemetry flush");
    }

    private RegressionEvent gpuLaunchDelay() {
        sleep(150);
        return update("gpu-launch-delay", 150,
                "obstacle-ai: CPU dispatch completed; GPU kernel launch delayed by 150ms");
    }

    private RegressionEvent pcieP2p() {
        syntheticLatency.addAndGet(210);
        return update("pcie-p2p", 480,
                "render-gpu: Non-optimal P2P topology detected; map tensor copied through host memory");
    }

    private RegressionEvent bandwidthSaturation() {
        var workers = 8;
        var latch = new CountDownLatch(workers);
        for (int i = 0; i < workers; i++) {
            workerPool.submit(() -> {
                try {
                    var src = new byte[4 * 1024 * 1024];
                    var dst = new byte[4 * 1024 * 1024];
                    for (int n = 0; n < 18; n++) {
                        System.arraycopy(src, 0, dst, 0, src.length);
                    }
                } finally {
                    latch.countDown();
                }
            });
        }
        await(latch, 750);
        syntheticLatency.updateAndGet(value -> Math.max(value * 3, value + 220));
        activeWorkers.addAndGet(workers);
        return update("bandwidth-saturation", 750,
                "stream-bus: concurrent memory copies saturated bandwidth; command loop slowed by 3x");
    }

    private RegressionEvent compactionStorm() {
        var buffers = new ArrayList<byte[]>();
        for (int i = 0; i < 6; i++) {
            buffers.add(new byte[8 * 1024 * 1024]);
            sleep(18 + random.nextInt(50));
        }
        syntheticLatency.addAndGet(340);
        return update("compaction-storm", 520,
                "video-ingest: high-order allocation requested; memory compaction storm created jitter");
    }

    private RegressionEvent thunderingHerd() {
        var herd = 50;
        var gate = new CountDownLatch(1);
        var done = new CountDownLatch(herd);
        var contentions = new AtomicInteger();
        for (int i = 0; i < herd; i++) {
            workerPool.submit(() -> {
                await(gate, 500);
                if (!herdMutex.tryLock()) {
                    contentions.incrementAndGet();
                    herdMutex.lock();
                }
                try {
                    sleep(10);
                } finally {
                    herdMutex.unlock();
                    done.countDown();
                }
            });
        }
        gate.countDown();
        await(done, 1200);
        contextSwitchRate.set(38_000 + contentions.get() * 200);
        activeWorkers.addAndGet(herd);
        return update("thundering-herd", 1200,
                "delivery-event: woke 50 workers; mutex contention=" + contentions.get() + " context switches spiked");
    }

    private RegressionEvent update(String id, long impactMs, String systemLog) {
        synchronized (events) {
            var event = events.get(id).triggered("active", impactMs, systemLog);
            events.put(id, event);
            log.warn("[{}] {}", id, systemLog);
            return event;
        }
    }

    private void seedEvents() {
        put("interrupt-storm", "Virtualization Driver Interrupt Storm", "critical",
                "Sensor overflow floods virtual IRQs, spikes CPU steal, and makes the UI lag.");
        put("kernel-lockup", "Kernel High Lockup", "critical",
                "Drone route calculation holds a simulated spinlock and freezes peer kernel-mode tasks.");
        put("cache-bloat", "cgroup Memory Limit & Cache Bloat", "critical",
                "Map tile cache fills dirty pages under a strict cgroup memory ceiling.");
        put("numa-paradox", "NUMA Auto-balancing Paradox", "warning",
                "Regional data access slows after unintended hot-page migration.");
        put("pid-limit", "Container PID Limit Fork Failure", "critical",
                "Fleet scaling exhausts the container PID budget and fails thread creation.");
        put("journal-delay", "File System Journaling Delay", "warning",
                "Flight log writer blocks journal commits and stalls I/O.");
        put("gpu-launch-delay", "GPU Kernel Launch Delay", "warning",
                "Obstacle avoidance CPU dispatch waits before GPU execution starts.");
        put("bandwidth-saturation", "Memory Bandwidth Saturation", "critical",
                "Concurrent streams copy large buffers and slow command control by 3x.");
        put("pcie-p2p", "GPU PCIe P2P Topology Mismatch", "warning",
                "Drone map render slows when peer GPU data stages through host memory.");
        put("compaction-storm", "Memory Compaction Storm", "critical",
                "High-order video buffer allocation forces page shuffling and erratic jitter.");
        put("thundering-herd", "Thundering Herd Problem", "critical",
                "A new delivery wakes 50 workers into mutex contention.");
    }

    private void put(String id, String title, String severity, String symptom) {
        events.put(id, new RegressionEvent(id, title, severity, "standby", symptom, "standby", 0, null));
    }

    private long jitter(int bound) {
        return random.nextInt(Math.max(1, bound));
    }

    private double clamp(double value, double min, double max) {
        return Math.max(min, Math.min(max, value));
    }

    private void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
        }
    }

    private void await(CountDownLatch latch, long ms) {
        try {
            latch.await(ms, TimeUnit.MILLISECONDS);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
        }
    }
}
