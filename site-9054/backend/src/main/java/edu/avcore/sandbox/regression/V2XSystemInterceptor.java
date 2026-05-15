package edu.avcore.sandbox.regression;

import edu.avcore.sandbox.model.EventLogEntry;
import edu.avcore.sandbox.model.RegressionSignal;
import edu.avcore.sandbox.model.TelemetrySnapshot;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.nio.ByteBuffer;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Queue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.locks.LockSupport;
import java.util.stream.Collectors;

@Component
public class V2XSystemInterceptor {
    private final Map<String, RegressionWorker> workers;
    private final Queue<EventLogEntry> eventRing = new ArrayDeque<>();
    private final Object eventLock = new Object();
    private final AtomicLong clockFreezeUntilNanos = new AtomicLong(0L);

    public V2XSystemInterceptor() {
        List<RegressionWorker> configured = List.of(
                new SecureMemoryAccessWorker(),
                new CameraGsoOverloadWorker(),
                new Avx512PathOptimizationWorker(),
                new RpsRfsMismatchWorker(),
                new L3CacheWayContentionWorker(),
                new CriticalUpdateLockupWorker(clockFreezeUntilNanos),
                new BlackBoxLoggerWorker(),
                new GpuBuddyFragmentationWorker(),
                new FalseSharingWorker(),
                new CloudDStateWorker(),
                new CacheLineBouncingWorker()
        );
        this.workers = configured.stream().collect(Collectors.toConcurrentMap(RegressionWorker::id, worker -> worker));
    }

    @Scheduled(fixedRate = 250)
    public void interceptTelemetryPath() {
        workers.values().forEach(worker -> {
            if (worker.enabled()) {
                worker.tick();
                RegressionSignal signal = worker.signal();
                if (signal.pressure() > 0.72d) {
                    append(signal.severity(), signal.subsystem(), signal.name() + " pressure=" + String.format("%.2f", signal.pressure()));
                }
            }
        });
    }

    public List<RegressionSignal> regressions() {
        return workers.values().stream()
                .map(RegressionWorker::signal)
                .sorted(Comparator.comparing(RegressionSignal::id))
                .toList();
    }

    public Optional<RegressionSignal> toggle(String id) {
        RegressionWorker worker = workers.get(id);
        if (worker == null) {
            return Optional.empty();
        }
        worker.setEnabled(!worker.enabled());
        append("INFO", worker.subsystem(), worker.name() + " toggled " + (worker.enabled() ? "on" : "off"));
        return Optional.of(worker.signal());
    }

    public TelemetrySnapshot snapshot() {
        List<RegressionSignal> signals = regressions();
        double aggregate = signals.stream().mapToDouble(RegressionSignal::pressure).average().orElse(0.0d);
        double collision = signals.stream().filter(signal -> signal.severity().equals("CRITICAL")).count();
        boolean frozen = System.nanoTime() < clockFreezeUntilNanos.get();
        return new TelemetrySnapshot(
                frozen ? Instant.now().minusMillis(550) : Instant.now(),
                82.0d - aggregate * 18.0d,
                Math.sin(System.currentTimeMillis() / 900.0d) * (8.0d + aggregate * 12.0d),
                76.0d - aggregate * 9.0d,
                Math.min(1.0d, 0.34d + aggregate * 0.58d),
                signals.stream().filter(s -> s.id().equals("gpu-memory-buddy-fragmentation")).findFirst().map(RegressionSignal::pressure).orElse(0.0d),
                Math.min(0.35d, aggregate * 0.22d + collision * 0.015d),
                Math.max(0.25d, 0.97d - aggregate * 0.41d),
                18.0d + aggregate * 140.0d,
                frozen,
                signals,
                recentEvents()
        );
    }

    private void append(String severity, String source, String message) {
        synchronized (eventLock) {
            eventRing.add(new EventLogEntry(Instant.now(), severity, source, message));
            while (eventRing.size() > 120) {
                eventRing.poll();
            }
        }
    }

    private List<EventLogEntry> recentEvents() {
        synchronized (eventLock) {
            List<EventLogEntry> entries = new ArrayList<>(eventRing);
            Collections.reverse(entries);
            return entries;
        }
    }

    static final class SecureMemoryAccessWorker extends AbstractRegressionWorker {
        private final List<ByteBuffer> pages = new ArrayList<>();

        SecureMemoryAccessWorker() {
            super("virtual-memory-protection-violation", "Secure Memory Access", "MMU/TLB",
                    "Models frequent mprotect-style permission flips, kernel overhead, and TLB shootdowns.");
        }

        @Override
        public void tick() {
            for (int i = 0; i < 48; i++) {
                ByteBuffer page = ByteBuffer.allocateDirect(4096);
                page.putInt(0, i);
                pages.add(page);
            }
            if (pages.size() > 512) {
                pages.subList(0, 256).clear();
            }
            record(jitter(0.64d, 0.14d));
        }
    }

    static final class CameraGsoOverloadWorker extends AbstractRegressionWorker {
        CameraGsoOverloadWorker() {
            super("gro-gso-disabled-cpu-overload", "High-Speed Camera Stream", "Perception Network",
                    "Processes segmented camera payloads as tiny packets to mimic disabled GRO/GSO offload.");
        }

        @Override
        public void tick() {
            long checksum = 0;
            for (int packet = 0; packet < 2200; packet++) {
                checksum ^= (packet * 31L) ^ (checksum >>> 3);
            }
            record(jitter(0.72d + (checksum & 7) * 0.01d, 0.10d));
        }
    }

    static final class Avx512PathOptimizationWorker extends AbstractRegressionWorker {
        Avx512PathOptimizationWorker() {
            super("register-context-latency", "Complex Path Optimization", "Planner SIMD",
                    "Runs wide-vector-like matrix loops to model heavy register context save/restore cost.");
        }

        @Override
        public void tick() {
            double[] vector = new double[512];
            for (int i = 0; i < vector.length; i++) {
                vector[i] = Math.sin(i) * Math.cos(i / 3.0d);
            }
            double acc = 0.0d;
            for (int round = 0; round < 80; round++) {
                for (double value : vector) {
                    acc += Math.fma(value, 1.00013d, acc * 0.000001d);
                }
            }
            record(jitter(0.58d + Math.abs(acc % 0.08d), 0.09d));
        }
    }

    static final class RpsRfsMismatchWorker extends AbstractRegressionWorker {
        RpsRfsMismatchWorker() {
            super("rps-rfs-mismatch", "Steering Command Service", "V2X IRQ Routing",
                    "Models packet steering mismatched with CPU affinity, causing IPI storms.");
        }

        @Override
        public void tick() {
            Thread.yield();
            LockSupport.parkNanos(50_000);
            record(jitter(0.67d, 0.17d));
        }
    }

    static final class L3CacheWayContentionWorker extends AbstractRegressionWorker {
        private final int[] fusionBuffer = new int[4 * 1024 * 1024];

        L3CacheWayContentionWorker() {
            super("l3-cache-way-contention", "Sensor Fusion Buffer", "LLC",
                    "Strides through same-index buffer regions to mimic L3 cache set contention.");
        }

        @Override
        public void tick() {
            int stride = 4096;
            int sum = 0;
            for (int i = 0; i < fusionBuffer.length; i += stride) {
                fusionBuffer[i] = fusionBuffer[i] + 1;
                sum += fusionBuffer[i];
            }
            record(jitter(0.70d + (sum & 3) * 0.01d, 0.13d));
        }
    }

    static final class CriticalUpdateLockupWorker extends AbstractRegressionWorker {
        private final AtomicLong freezeUntil;

        CriticalUpdateLockupWorker(AtomicLong freezeUntil) {
            super("hard-lockup-via-interrupt-disablement", "Critical Update", "Kernel IRQ",
                    "Freezes the exported UI clock for 500ms+ to visualize interrupt-disabled stutter.");
            this.freezeUntil = freezeUntil;
        }

        @Override
        public void tick() {
            if (ThreadLocalRandom.current().nextInt(8) == 0) {
                freezeUntil.set(System.nanoTime() + 620_000_000L);
                record(0.95d);
            } else {
                record(jitter(0.50d, 0.18d));
            }
        }
    }

    static final class BlackBoxLoggerWorker extends AbstractRegressionWorker {
        private final List<byte[]> segments = new ArrayList<>();

        BlackBoxLoggerWorker() {
            super("log-structured-fs-cleaning-congestion", "Black Box Logger", "Storage",
                    "Accumulates log segments and periodically performs blocking cleaning/GC work.");
        }

        @Override
        public void tick() {
            segments.add(new byte[64 * 1024]);
            if (segments.size() > 96) {
                segments.subList(0, 64).clear();
                LockSupport.parkNanos(8_000_000);
                record(0.91d);
                return;
            }
            record(jitter(0.46d, 0.16d));
        }
    }

    static final class GpuBuddyFragmentationWorker extends AbstractRegressionWorker {
        private final List<ByteBuffer> tiles = new ArrayList<>();

        GpuBuddyFragmentationWorker() {
            super("gpu-memory-buddy-fragmentation", "Texture Loader", "GPU Memory",
                    "Allocates and releases thousands of 4KB texture tiles to mimic buddy allocator fragmentation.");
        }

        @Override
        public void tick() {
            for (int i = 0; i < 128; i++) {
                tiles.add(ByteBuffer.allocateDirect(4096));
            }
            if (tiles.size() > 2048) {
                for (int i = 0; i < 1024; i += 2) {
                    tiles.remove(i);
                }
            }
            record(jitter(Math.min(0.96d, tiles.size() / 2300.0d), 0.08d));
        }
    }

    static final class FalseSharingWorker extends AbstractRegressionWorker {
        private volatile long droneA;
        private volatile long droneB;

        FalseSharingWorker() {
            super("false-sharing-contention", "Multi-Drone Sync", "MESI",
                    "Updates neighboring counters to mimic false sharing on a shared cache line.");
        }

        @Override
        public void tick() {
            for (int i = 0; i < 35_000; i++) {
                droneA++;
                droneB++;
            }
            record(jitter(0.69d, 0.15d));
        }
    }

    static final class CloudDStateWorker extends AbstractRegressionWorker {
        CloudDStateWorker() {
            super("d-state-process-accumulation", "Cloud Sync", "Mock Device I/O",
                    "Waits on a non-responsive mock device path to model D-state load-average inflation.");
        }

        @Override
        public void tick() {
            LockSupport.parkNanos(14_000_000);
            record(jitter(0.62d, 0.20d));
        }
    }

    static final class CacheLineBouncingWorker extends AbstractRegressionWorker {
        private final AtomicLong globalSystemState = new AtomicLong();

        CacheLineBouncingWorker() {
            super("cache-line-bouncing", "Global System State", "L1 Coherency",
                    "Eight simulated producers update one global state variable to model cross-core cache bouncing.");
        }

        @Override
        public void tick() {
            for (int thread = 0; thread < 8; thread++) {
                for (int i = 0; i < 9000; i++) {
                    globalSystemState.incrementAndGet();
                }
            }
            record(jitter(0.76d, 0.12d));
        }
    }
}
