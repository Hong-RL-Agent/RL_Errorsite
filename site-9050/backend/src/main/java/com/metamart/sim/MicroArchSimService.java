package com.metamart.sim;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.locks.ReentrantLock;

@Service
public class MicroArchSimService {
    private static final Logger log = LoggerFactory.getLogger(MicroArchSimService.class);
    private static final int VRAM_LIMIT_MB = 384;

    private final Random random = new SecureRandom();
    private final ExecutorService background = Executors.newFixedThreadPool(3);
    private final ReentrantLock rcuLock = new ReentrantLock();
    private final ReentrantLock checkoutMutex = new ReentrantLock();
    private final Queue<TelemetryEvent> events = new ArrayDeque<>();
    private final Map<String, AtomicLong> counters = new ConcurrentHashMap<>();
    private final AtomicLong requestCount = new AtomicLong();
    private final AtomicInteger activeCore = new AtomicInteger(0);
    private final AtomicInteger transactionLogEntries = new AtomicInteger(0);
    private final AtomicLong simulatedVramMb = new AtomicLong(256);

    @PostConstruct
    void bootBackgroundLoad() {
        background.submit(this::softirqLivelockPulse);
    }

    public void recordRequest() {
        requestCount.incrementAndGet();
    }

    public void simulateSessionColdStart(boolean newSession) {
        if (!newSession) {
            return;
        }
        sleep(50);
        emit("process-migration-cold-start", "WARN", 50, "New session paid cold-cache penalty after simulated CPU migration.");
    }

    public void simulateCoreMigrationPenalty() {
        int nextCore = ThreadLocalRandom.current().nextInt(Math.max(2, Runtime.getRuntime().availableProcessors()));
        int previous = activeCore.getAndSet(nextCore);
        if (previous != nextCore) {
            sleep(12);
            emit("context-switching-cache-flush", "WARN", 12, "Active core changed from " + previous + " to " + nextCore + "; applied global cache-flush penalty.");
        }
    }

    public void simulateDramRefreshJitter() {
        if (ThreadLocalRandom.current().nextInt(100) < 35) {
            long delay = ThreadLocalRandom.current().nextLong(5, 11);
            sleep(delay);
            emit("memory-bus-refresh-latency", "INFO", delay, "DRAM refresh cycle blocked memory access.");
        }
    }

    public SimResult renderAsset() {
        long start = System.nanoTime();
        long usage = simulatedVramMb.addAndGet(ThreadLocalRandom.current().nextLong(32, 96));
        boolean overswap = usage > VRAM_LIMIT_MB;
        if (overswap) {
            sleep(500);
            simulatedVramMb.set(256);
            emit("gpu-unified-memory-over-swapping", "CRITICAL", 500, "3D asset render exceeded " + VRAM_LIMIT_MB + "MB VRAM limit and fell back to slow PCIe swaps.");
        } else {
            sleep(18);
        }
        return result("GPU Unified Memory Over-swapping", start, overswap, "VRAM usage sampled at " + usage + "MB.");
    }

    public SimResult textureSync() {
        long start = System.nanoTime();
        byte[] src = new byte[64 * 1024 * 1024];
        byte[] dst = new byte[64 * 1024 * 1024];
        for (int i = 0; i < 16; i++) {
            System.arraycopy(src, 0, dst, 0, src.length);
        }
        emit("pcie-bus-bandwidth-saturation", "WARN", elapsedMs(start), "Texture sync copied a simulated 1GB payload across memory buffers.");
        return result("PCIe Bus Bandwidth Saturation", start, true, "Moved 1GB equivalent texture payload.");
    }

    public SimResult triggerRcuStall() {
        long start = System.nanoTime();
        background.submit(() -> {
            rcuLock.lock();
            try {
                long until = System.nanoTime() + 330_000_000L;
                long sink = 0;
                while (System.nanoTime() < until) {
                    sink += Math.sqrt(ThreadLocalRandom.current().nextDouble(1, 1000));
                }
                log.info("kernel: INFO: rcu_sched self-detected stall, synthetic sink={}", sink);
                emit("kernel-rcu-stall", "CRITICAL", 330, "Background compute loop held an RCU-like lock for 300ms+.");
            } finally {
                rcuLock.unlock();
            }
        });
        return result("Kernel RCU Stall", start, true, "RCU stall submitted to background worker.");
    }

    public SimResult appendTransactionLog() {
        long start = System.nanoTime();
        int entry = transactionLogEntries.incrementAndGet();
        long delay = entry > 100 ? 25 : 5;
        sleep(delay);
        emit("ssd-steady-state-performance-drop", entry > 100 ? "WARN" : "INFO", delay, "Transaction log entry " + entry + " wrote at " + (entry > 100 ? "steady-state degraded" : "fresh NAND") + " speed.");
        return result("SSD Steady State Performance Drop", start, entry > 100, "Transaction log contains " + entry + " entries.");
    }

    public SimResult executeShader() {
        long start = System.nanoTime();
        boolean tail = ThreadLocalRandom.current().nextInt(100) == 0;
        sleep(tail ? 200 : 1);
        emit("gpu-kernel-tail-latency", tail ? "CRITICAL" : "INFO", elapsedMs(start), tail ? "Uneven shader workload hit 99th percentile tail." : "Shader completed on fast path.");
        return result("GPU Kernel Tail Latency", start, tail, tail ? "Tail task took 200ms." : "Fast shader lane took 1ms.");
    }

    public SimResult calculateDiscount() {
        long start = System.nanoTime();
        double value = 100.0;
        for (int i = 0; i < 35_000; i++) {
            boolean a = random.nextBoolean();
            boolean b = random.nextBoolean();
            boolean c = random.nextBoolean();
            boolean d = random.nextBoolean();
            if (a) {
                if (b) {
                    value += c ? 0.031 : -0.017;
                } else if (d) {
                    value *= c ? 1.00011 : 0.99991;
                } else {
                    value -= a == c ? 0.013 : 0.007;
                }
            } else {
                if (c && !d) {
                    value += b ? 0.021 : -0.019;
                } else if (b || d) {
                    value *= a == d ? 0.99997 : 1.00007;
                } else {
                    value += random.nextBoolean() ? 0.005 : -0.004;
                }
            }
        }
        emit("branch-misprediction", "WARN", elapsedMs(start), "Random nested discount branches intentionally defeated branch prediction. Discount score=" + Math.round(value));
        return result("Branch Misprediction", start, true, "Discount score=" + Math.round(value));
    }

    public SimResult checkoutWithPriorityInversion() {
        long start = System.nanoTime();
        Thread lowPriorityEmail = new Thread(() -> {
            checkoutMutex.lock();
            try {
                sleep(260);
                emit("priority-inversion", "WARN", 260, "Low-priority email task held checkout mutex.");
            } finally {
                checkoutMutex.unlock();
            }
        }, "low-priority-email-task");
        lowPriorityEmail.setPriority(Thread.MIN_PRIORITY);
        lowPriorityEmail.start();
        sleep(20);
        checkoutMutex.lock();
        try {
            appendTransactionLog();
        } finally {
            checkoutMutex.unlock();
        }
        return result("Priority Inversion", start, true, "Checkout waited behind low-priority email mutex.");
    }

    public TelemetrySnapshot snapshot() {
        synchronized (events) {
            return new TelemetrySnapshot(
                    requestCount.get(),
                    activeCore.get(),
                    transactionLogEntries.get(),
                    simulatedVramMb.get(),
                    new ArrayList<>(events),
                    counters.entrySet().stream().collect(LinkedHashMap::new, (m, e) -> m.put(e.getKey(), e.getValue().get()), LinkedHashMap::putAll)
            );
        }
    }

    private void softirqLivelockPulse() {
        while (!Thread.currentThread().isInterrupted()) {
            if (requestCount.get() % 25 == 0 && requestCount.get() > 0) {
                long until = System.nanoTime() + 180_000_000L;
                while (System.nanoTime() < until) {
                    Math.log(ThreadLocalRandom.current().nextDouble(2, 1000));
                }
                emit("network-softirq-livelock", "CRITICAL", 180, "Synthetic core saturated while handling high-volume network interrupts.");
            }
            sleep(1000);
        }
    }

    private SimResult result(String pattern, long start, boolean triggered, String detail) {
        return new SimResult(pattern, elapsedMs(start), triggered, detail);
    }

    private long elapsedMs(long start) {
        return Math.max(1, (System.nanoTime() - start) / 1_000_000L);
    }

    private void emit(String pattern, String severity, long latencyMs, String detail) {
        counters.computeIfAbsent(pattern, key -> new AtomicLong()).incrementAndGet();
        TelemetryEvent event = new TelemetryEvent(Instant.now(), pattern, severity, latencyMs, detail);
        synchronized (events) {
            events.add(event);
            while (events.size() > 80) {
                events.poll();
            }
        }
        log.info("[META-MART][{}][{}] {}ms {}", severity, pattern, latencyMs, detail);
    }

    private void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
