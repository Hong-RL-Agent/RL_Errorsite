package edu.abyssal.deepsea.service;

import edu.abyssal.deepsea.config.DeepSeaProperties;
import edu.abyssal.deepsea.model.CoreStatus;
import edu.abyssal.deepsea.model.FaultMetric;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Random;
import java.util.concurrent.Semaphore;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;
import java.util.concurrent.locks.LockSupport;

@Service
public class DeepSeaControlService {
    private static final int SERIES_SIZE = 72;
    private static final int TERRAIN_CELLS = 144;

    private final DeepSeaProperties properties;
    private final Semaphore diskQueue;
    private final AtomicLong tick = new AtomicLong();
    private final AtomicInteger dirtyPages = new AtomicInteger();
    private final AtomicInteger vramFragments = new AtomicInteger(38);
    private final AtomicInteger watchdogMisses = new AtomicInteger();
    private final AtomicReference<CoreStatus> latest = new AtomicReference<>();
    private final ArrayDeque<Double> depthSeries = new ArrayDeque<>();
    private final ArrayDeque<Double> pressureSeries = new ArrayDeque<>();

    public DeepSeaControlService(DeepSeaProperties properties) {
        this.properties = properties;
        this.diskQueue = new Semaphore(properties.safeDiskQueueDepth());
        for (int i = 0; i < SERIES_SIZE; i++) {
            depthSeries.add(5980.0);
            pressureSeries.add(602.0);
        }
        latest.set(sampleStatus());
    }

    public CoreStatus currentStatus() {
        return latest.get();
    }

    @Scheduled(fixedRate = 900)
    void refreshTelemetry() {
        latest.set(sampleStatus());
    }

    private CoreStatus sampleStatus() {
        long n = tick.incrementAndGet();
        double intensity = properties.normalizedIntensity();
        double wave = Math.sin(n / 5.0);
        double depth = 6000.0 + wave * 18.0 + jitter(4.5);
        double pressure = depth * 0.1007 + 1.0 + jitter(1.8);

        List<FaultMetric> faults = List.of(
                virtualizationPauseLoop(intensity),
                diskQueueSaturation(intensity),
                tsxAbort(intensity),
                splitLockBusPenalty(intensity),
                kernelDirtyThrottle(intensity),
                stealTimePressure(intensity),
                vramBuddyFailure(intensity),
                realtimeStarvationWatchdog(intensity),
                pcieLaneContention(intensity),
                thermalThrottle(intensity),
                cfsQuotaThrottle(intensity)
        );

        push(depthSeries, depth);
        push(pressureSeries, pressure);

        double severityAvg = faults.stream().mapToDouble(FaultMetric::severity).average().orElse(0);
        double oxygen = clamp(94.0 - severityAvg * 13.0 + jitter(0.8), 68.0, 99.0);
        double power = clamp(88.0 - severityAvg * 19.0 + jitter(1.2), 42.0, 98.0);
        double cpuTemp = clamp(58.0 + fault(faults, "thermal-throttle").severity() * 43.0 + jitter(1.5), 42.0, 104.0);
        double cpuClock = clamp(3.7 - fault(faults, "thermal-throttle").severity() * 1.9, 1.2, 4.1);
        double steal = fault(faults, "vm-steal-time").severity() * 41.0;
        double pcie = clamp(26.0 - fault(faults, "pcie-lane-contention").severity() * 18.0, 4.0, 28.0);
        double sonarIntegrity = clamp(99.0 - fault(faults, "vram-fragmentation").severity() * 31.0, 47.0, 100.0);

        return new CoreStatus(
                Instant.now(),
                round(depth),
                round(pressure),
                round(oxygen),
                round(power),
                round(cpuTemp),
                round(cpuClock),
                round(steal),
                round(pcie),
                round(sonarIntegrity),
                depthSeries.stream().map(DeepSeaControlService::round).toList(),
                pressureSeries.stream().map(DeepSeaControlService::round).toList(),
                terrainGrid(n),
                faults,
                eventLog(faults)
        );
    }

    private FaultMetric virtualizationPauseLoop(double intensity) {
        long spins = (long) (40_000 + intensity * 220_000);
        for (long i = 0; i < spins; i++) {
            if ((i & 4095) == 0) {
                Thread.onSpinWait();
            }
        }
        LockSupport.parkNanos((long) (intensity * 900_000));
        return metric("vm-pause-loop", "Virtual PAUSE loop exit", "hypervisor", intensity * 0.78,
                1.4 + intensity * 7.5, "HV_EXIT", "spinlock wait yielded to hypervisor");
    }

    private FaultMetric diskQueueSaturation(double intensity) {
        int permits = 1 + (int) Math.round(intensity * properties.safeDiskQueueDepth());
        int acquired = 0;
        for (int i = 0; i < permits; i++) {
            if (diskQueue.tryAcquire()) {
                acquired++;
            }
        }
        int queued = Math.max(0, permits - acquired);
        if (acquired > 0) {
            diskQueue.release(acquired);
        }
        return metric("disk-queue-saturation", "NCQ/TCQ queue saturation", "storage", intensity * 0.86,
                4.0 + queued * 2.6 + intensity * 12.0, queued > 0 ? "QUEUE_FULL" : "DEGRADED",
                "disk command queue depth " + properties.safeDiskQueueDepth() + " under seabed log writes");
    }

    private FaultMetric tsxAbort(double intensity) {
        int aborts = (int) (12 + intensity * 68 + ThreadLocalRandom.current().nextInt(12));
        return metric("tsx-transaction-abort", "TSX transaction abort rollback", "cpu", intensity * 0.81,
                2.0 + aborts * 0.19, "RTM_ABORT", aborts + " integrity transactions rolled back");
    }

    private FaultMetric splitLockBusPenalty(double intensity) {
        byte[] cacheLine = new byte[128];
        int offset = 63;
        int checksum = 0;
        for (int i = 0; i < 64 + intensity * 128; i++) {
            checksum += cacheLine[offset] + cacheLine[offset + 1];
        }
        return metric("split-lock", "Split lock bus serialization", "cpu", intensity * 0.73,
                1.8 + intensity * 14.0, "BUS_LOCK", "misaligned sensor word crossed cache line; checksum=" + checksum);
    }

    private FaultMetric kernelDirtyThrottle(double intensity) {
        int pages = dirtyPages.updateAndGet(v -> Math.min(4096, v + 80 + (int) (intensity * 330)));
        if (pages > 2800) {
            LockSupport.parkNanos((long) (intensity * 1_200_000));
            dirtyPages.addAndGet(-900);
        }
        return metric("dirty-throttle", "Kernel dirty page throttling", "kernel", clamp(pages / 4096.0, 0, 1),
                3.0 + pages / 120.0, pages > 2800 ? "WRITEBACK_THROTTLED" : "DIRTY_ACCUMULATING",
                pages + " dirty pages buffered for expedition video");
    }

    private FaultMetric stealTimePressure(double intensity) {
        double burst = 0.2 + Math.abs(Math.sin(tick.get() / 3.0)) * 0.8;
        return metric("vm-steal-time", "Virtualization steal time surge", "hypervisor", intensity * burst,
                3.0 + intensity * burst * 35.0, "HOST_CONTENTION", "co-tenant VM consumed host CPU credits");
    }

    private FaultMetric vramBuddyFailure(double intensity) {
        int fragments = vramFragments.updateAndGet(v -> {
            int next = v + ThreadLocalRandom.current().nextInt(3, 10);
            return next > 96 ? 44 : next;
        });
        double severity = clamp((fragments / 100.0) * (0.55 + intensity), 0, 1);
        return metric("vram-fragmentation", "GPU VRAM buddy allocator failure", "gpu", severity,
                5.0 + fragments * 0.42, fragments > 82 ? "ALLOC_RETRY" : "FRAGMENTING",
                fragments + "% fragmented sonar image heap");
    }

    private FaultMetric realtimeStarvationWatchdog(double intensity) {
        if (intensity > 0.7 && tick.get() % 4 == 0) {
            watchdogMisses.incrementAndGet();
        }
        int misses = watchdogMisses.get();
        return metric("watchdog-starvation", "Realtime priority starvation watchdog", "scheduler",
                clamp(intensity * 0.69 + misses * 0.035, 0, 1), 2.4 + misses * 1.7,
                misses > 3 ? "WATCHDOG_PREBOOT" : "RT_TASK_HOG", misses + " heartbeat deadlines missed");
    }

    private FaultMetric pcieLaneContention(double intensity) {
        double laneSplit = tick.get() % 9 < 5 ? 0.72 : 0.38;
        return metric("pcie-lane-contention", "PCIe lane split bandwidth contention", "interconnect",
                clamp(intensity * laneSplit, 0, 1), 3.2 + intensity * laneSplit * 24.0,
                "DMA_BACKPRESSURE", "sonar GPU and NVMe recorder sharing x8 uplink");
    }

    private FaultMetric thermalThrottle(double intensity) {
        double coolingFault = 0.45 + Math.abs(Math.sin(tick.get() / 8.0)) * 0.55;
        return metric("thermal-throttle", "CPU thermal throttling", "cooling", clamp(intensity * coolingFault, 0, 1),
                1.6 + intensity * coolingFault * 19.0, "PROCHOT_ASSERTED",
                "coolant loop delta-T exceeded abyssal enclosure limit");
    }

    private FaultMetric cfsQuotaThrottle(double intensity) {
        double quotaPressure = clamp((100.0 - properties.safeCfsQuotaMs()) / 100.0 + intensity * 0.55, 0, 1);
        return metric("cfs-quota-throttle", "Container CFS quota throttling", "container",
                quotaPressure, 2.1 + quotaPressure * 28.0, "CFS_THROTTLED",
                "container exceeded " + properties.safeCfsQuotaMs() + "ms CPU quota window");
    }

    private List<Integer> terrainGrid(long n) {
        Random random = new Random(9056L + n / 2);
        List<Integer> cells = new ArrayList<>(TERRAIN_CELLS);
        for (int i = 0; i < TERRAIN_CELLS; i++) {
            double ridge = Math.sin((i % 12) * 0.9 + n * 0.04) + Math.cos((i / 12) * 0.7);
            cells.add((int) clamp(48 + ridge * 20 + random.nextInt(16), 0, 100));
        }
        return cells;
    }

    private List<String> eventLog(List<FaultMetric> faults) {
        return faults.stream()
                .sorted((a, b) -> Double.compare(b.severity(), a.severity()))
                .limit(6)
                .map(f -> String.format(Locale.ROOT, "%s | %s | %.0fms | %s",
                        f.status(), f.subsystem(), f.latencyMs(), f.evidence()))
                .toList();
    }

    private FaultMetric metric(String id, String name, String subsystem, double severity, double latencyMs,
                               String status, String evidence) {
        return new FaultMetric(id, name, subsystem, round(clamp(severity, 0, 1)), round(latencyMs), status, evidence);
    }

    private FaultMetric fault(List<FaultMetric> faults, String id) {
        return faults.stream().filter(f -> f.id().equals(id)).findFirst().orElseThrow();
    }

    private static void push(ArrayDeque<Double> series, double value) {
        if (series.size() >= SERIES_SIZE) {
            series.removeFirst();
        }
        series.addLast(value);
    }

    private static double jitter(double amplitude) {
        return ThreadLocalRandom.current().nextDouble(-amplitude, amplitude);
    }

    private static double clamp(double value, double min, double max) {
        return Math.max(min, Math.min(max, value));
    }

    private static double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
