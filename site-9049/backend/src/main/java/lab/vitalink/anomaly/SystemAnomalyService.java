package lab.vitalink.anomaly;

import jakarta.annotation.PostConstruct;
import lab.vitalink.telemetry.TelemetrySnapshot;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.Random;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class SystemAnomalyService {
    private static final Logger log = LoggerFactory.getLogger(SystemAnomalyService.class);

    private final AnomalyProperties properties;
    private final AtomicInteger dirtyBuffer = new AtomicInteger();
    private final AtomicLong irqCount = new AtomicLong();
    private final AtomicLong spinlockContentions = new AtomicLong();
    private final AtomicLong pageFaultStormWrites = new AtomicLong();
    private final AtomicLong unalignedAccessWarnings = new AtomicLong();
    private final AtomicLong simulatedMemoryPercent = new AtomicLong(42);
    private final AtomicLong avxDownclockUntil = new AtomicLong();
    private final AtomicBoolean sessionAlive = new AtomicBoolean(true);
    private final Object spinlock = new Object();
    private final Queue<String> kernelWarnings = new ArrayDeque<>();
    private final Map<String, Long> endpointLatencyMs = Collections.synchronizedMap(new LinkedHashMap<>());

    public SystemAnomalyService(AnomalyProperties properties) {
        this.properties = properties;
    }

    @PostConstruct
    void startBackgroundAnomalies() {
        if (properties.oomEnabled()) {
            Thread oomThread = new Thread(this::runSilentOomSimulation, "vita-oom-sentinel");
            oomThread.setDaemon(true);
            oomThread.start();
        }
        if (properties.noisyNeighborEnabled()) {
            Thread noisyNeighbor = new Thread(this::runNoisyNeighbor, "vita-noisy-neighbor");
            noisyNeighbor.setDaemon(true);
            noisyNeighbor.start();
        }
    }

    public Map<String, Object> saveMedicalRecord(String patientId, int payloadSize) {
        long started = System.nanoTime();
        applyGlobalAnomalies("record-save");
        int pages = Math.max(1, payloadSize / 512);
        int current = dirtyBuffer.addAndGet(pages);
        boolean writeback = current >= properties.dirtyThreshold();
        if (writeback) {
            sleep(properties.dirtyWritebackMs());
            dirtyBuffer.set(0);
            warn("pdflush/writeback contention: dirty_buffer threshold crossed during medical record save");
        }
        return timed("record-save", started, Map.of(
                "patientId", patientId,
                "status", sessionAlive.get() ? "persisted" : "session-reset",
                "dirtyBufferBeforeFlush", current,
                "writebackDelayApplied", writeback
        ));
    }

    public Map<String, Object> accessRemotePatientNode(String nodeId) {
        long started = System.nanoTime();
        applyGlobalAnomalies("remote-node");
        sleep(properties.numaLatencyMs());
        warn("NUMA inter-node access penalty: remote patient node " + nodeId + " fetched from non-local memory");
        return timed("remote-node", started, Map.of("nodeId", nodeId, "numaPenaltyMs", properties.numaLatencyMs()));
    }

    public Map<String, Object> streamDiagnosticImage() {
        long started = System.nanoTime();
        applyGlobalAnomalies("image-stream");
        for (int i = 0; i < 12_000; i++) {
            irqCount.incrementAndGet();
        }
        sleep(properties.irqFreezeMs());
        warn("Disk controller IRQ saturation: diagnostic image stream froze request loop for " + properties.irqFreezeMs() + "ms");
        return timed("image-stream", started, Map.of("irqCount", irqCount.get(), "uiFreezeMs", properties.irqFreezeMs()));
    }

    public Map<String, Object> runGenomicAnalysis() {
        long started = System.nanoTime();
        applyGlobalAnomalies("genomic-analysis");
        avxDownclockUntil.set(System.currentTimeMillis() + properties.avxDownclockMs());
        warn("AVX-512 clock down simulation active for " + properties.avxDownclockMs() + "ms");
        return timed("genomic-analysis", started, Map.of("globalDownclockMs", properties.avxDownclockMs()));
    }

    public Map<String, Object> contendSpinlock() {
        long started = System.nanoTime();
        applyGlobalAnomalies("spinlock");
        synchronized (spinlock) {
            spinlockContentions.incrementAndGet();
            busyWait(180);
        }
        return timed("spinlock", started, Map.of("spinlockContentions", spinlockContentions.get()));
    }

    public Map<String, Object> triggerCowFaultStorm() {
        long started = System.nanoTime();
        applyGlobalAnomalies("cow-fault-storm");
        int bufferMb = Math.max(16, properties.cowBufferMb());
        int threads = Math.max(2, properties.cowThreads());
        byte[] sharedBuffer = new byte[bufferMb * 1024 * 1024];
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        for (int t = 0; t < threads; t++) {
            final int offset = t;
            executor.submit(() -> {
                for (int i = offset; i < sharedBuffer.length; i += 4096) {
                    sharedBuffer[i] = (byte) (sharedBuffer[i] + 1);
                    pageFaultStormWrites.incrementAndGet();
                }
            });
        }
        executor.shutdown();
        await(executor);
        warn("CoW page fault storm: " + threads + " writers touched shared " + bufferMb + "MB buffer");
        return timed("cow-fault-storm", started, Map.of("bufferMb", bufferMb, "writers", threads, "pageWrites", pageFaultStormWrites.get()));
    }

    public Map<String, Object> serializeClinicalPayload() {
        long started = System.nanoTime();
        applyGlobalAnomalies("serialization");
        long address = 0x7f00_0000L + ThreadLocalRandom.current().nextLong(0x10_0000);
        sleep(140);
        unalignedAccessWarnings.incrementAndGet();
        warn("Unaligned memory access at 0x" + Long.toHexString(address) + " (Performance penalty: 2x)");
        return timed("serialization", started, Map.of("alignment", "unaligned", "penalty", "2x"));
    }

    public Map<String, Object> processConsultation() {
        long started = System.nanoTime();
        applyGlobalAnomalies("consultation");
        busyWait(35);
        return timed("consultation", started, Map.of("status", sessionAlive.get() ? "active" : "session-reset-by-oom"));
    }

    public TelemetrySnapshot snapshot() {
        long remaining = Math.max(0, avxDownclockUntil.get() - System.currentTimeMillis());
        synchronized (kernelWarnings) {
            return new TelemetrySnapshot(
                    Instant.now(),
                    sessionAlive.get(),
                    dirtyBuffer.get(),
                    irqCount.get(),
                    spinlockContentions.get(),
                    pageFaultStormWrites.get(),
                    unalignedAccessWarnings.get(),
                    simulatedMemoryPercent.get(),
                    remaining,
                    new ArrayList<>(kernelWarnings),
                    new LinkedHashMap<>(endpointLatencyMs)
            );
        }
    }

    public void resetSession() {
        sessionAlive.set(true);
        simulatedMemoryPercent.set(42);
        dirtyBuffer.set(0);
        synchronized (kernelWarnings) {
            kernelWarnings.clear();
        }
    }

    private void applyGlobalAnomalies(String operation) {
        long jitter = ThreadLocalRandom.current().nextLong(properties.cpuJitterMinMs(), properties.cpuJitterMaxMs() + 1);
        sleep(jitter);

        if (System.currentTimeMillis() < avxDownclockUntil.get()) {
            sleep(120);
        }

        if (ThreadLocalRandom.current().nextDouble() < properties.smiProbability()) {
            sleep(properties.smiLatencyMs());
        }
    }

    private void runSilentOomSimulation() {
        while (true) {
            sleep(properties.oomTickMs());
            long usage = simulatedMemoryPercent.updateAndGet(v -> Math.min(100, v + properties.oomIncrementPercent()));
            if (usage >= 90 && sessionAlive.compareAndSet(true, false)) {
                // Intentionally no application warning: this models silent OOM session reclamation.
            }
            if (usage >= 100) {
                simulatedMemoryPercent.set(55);
            }
        }
    }

    private void runNoisyNeighbor() {
        while (true) {
            sleep(properties.noisyNeighborPeriodMs());
            busyWait(properties.noisyNeighborSpinMs());
            warn("Noisy neighbor stole CPU cycles for " + properties.noisyNeighborSpinMs() + "ms");
        }
    }

    private Map<String, Object> timed(String endpoint, long started, Map<String, Object> body) {
        long elapsed = TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - started);
        endpointLatencyMs.put(endpoint, elapsed);
        Map<String, Object> response = new LinkedHashMap<>(body);
        response.put("latencyMs", elapsed);
        response.put("sessionAlive", sessionAlive.get());
        return response;
    }

    private void warn(String message) {
        log.warn(message);
        synchronized (kernelWarnings) {
            if (kernelWarnings.size() >= 10) {
                kernelWarnings.poll();
            }
            kernelWarnings.offer(message);
        }
    }

    private void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException interrupted) {
            Thread.currentThread().interrupt();
        }
    }

    private void busyWait(long millis) {
        long until = System.nanoTime() + TimeUnit.MILLISECONDS.toNanos(millis);
        Random random = ThreadLocalRandom.current();
        double sink = 0;
        while (System.nanoTime() < until) {
            sink += Math.sqrt(random.nextDouble() + sink);
        }
        if (sink == 42) {
            log.debug("spin sink={}", sink);
        }
    }

    private void await(ExecutorService executor) {
        try {
            if (!executor.awaitTermination(20, TimeUnit.SECONDS)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException interrupted) {
            executor.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }
}
