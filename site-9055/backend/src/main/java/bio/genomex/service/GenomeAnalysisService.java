package bio.genomex.service;

import bio.genomex.config.SimulationProperties;
import bio.genomex.model.Bottleneck;
import bio.genomex.model.SequencingFrame;
import bio.genomex.model.TelemetrySnapshot;
import jakarta.annotation.PostConstruct;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.lang.management.ManagementFactory;
import java.nio.ByteBuffer;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;

@Service
public class GenomeAnalysisService {
    private static final List<String> STAGES = List.of(
            "Nanopore ingest", "Alignment", "Variant calling", "Gene fusion", "Clinical annotation");

    private final SimulationProperties properties;
    private final ExecutorService workers = Executors.newFixedThreadPool(Math.max(4, Runtime.getRuntime().availableProcessors()));
    private final AtomicBoolean running = new AtomicBoolean(false);
    private final AtomicReference<String> runId = new AtomicReference<>("idle");
    private final Map<String, BottleneckState> bottlenecks = new ConcurrentHashMap<>();
    private final AtomicLong tick = new AtomicLong(0);
    private volatile double requestedIntensity;
    private volatile double progress;
    private volatile double throughput;
    private volatile double p95Latency;
    private volatile double cpuCore0;
    private volatile double cpuOthers;
    private volatile double memoryPressure;
    private volatile double iops;
    private volatile double gpuLaunchRate;
    private volatile String activeStage = "Standby";
    private Path dataDir;

    public GenomeAnalysisService(SimulationProperties properties) {
        this.properties = properties;
        this.requestedIntensity = properties.getIntensity();
        registerBottlenecks();
    }

    @PostConstruct
    void initialize() throws IOException {
        dataDir = Path.of(properties.getDataDir());
        Files.createDirectories(dataDir.resolve("logs"));
        Files.createDirectories(dataDir.resolve("micro-results"));
    }

    public TelemetrySnapshot startRun(double intensity) {
        requestedIntensity = Math.max(0.1, Math.min(1.0, intensity));
        progress = 0.0;
        runId.set("GX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT));
        running.set(properties.isEnabled());
        return snapshot();
    }

    public TelemetrySnapshot stopRun() {
        running.set(false);
        activeStage = "Paused";
        return snapshot();
    }

    @Scheduled(fixedDelay = 900)
    public void analysisPulse() {
        long now = tick.incrementAndGet();
        if (!running.get()) {
            idleTelemetry();
            return;
        }

        progress = Math.min(99.8, progress + 0.45 + ThreadLocalRandom.current().nextDouble(0.8));
        activeStage = STAGES.get((int) ((now / 7) % STAGES.size()));
        runControlledRegressionCycle(now);
        aggregateTelemetry();
    }

    public TelemetrySnapshot snapshot() {
        return new TelemetrySnapshot(
                Instant.now(),
                runId.get(),
                running.get(),
                progress,
                throughput,
                p95Latency,
                cpuCore0,
                cpuOthers,
                memoryPressure,
                iops,
                gpuLaunchRate,
                activeStage,
                bottlenecks.values().stream()
                        .sorted(Comparator.comparing(state -> state.definition.id()))
                        .map(BottleneckState::toBottleneck)
                        .toList()
        );
    }

    public SequencingFrame sequencingFrame() {
        Random random = ThreadLocalRandom.current();
        List<String> reads = new ArrayList<>();
        List<Double> confidence = new ArrayList<>();
        List<Integer> variants = new ArrayList<>();
        char[] bases = {'A', 'C', 'G', 'T'};

        for (int row = 0; row < 9; row++) {
            StringBuilder read = new StringBuilder();
            for (int i = 0; i < 72; i++) {
                read.append(bases[random.nextInt(bases.length)]);
                if (random.nextDouble() < 0.018) {
                    variants.add(row * 72 + i);
                }
            }
            reads.add(read.toString());
            confidence.add(0.89 + random.nextDouble() * 0.105);
        }
        return new SequencingFrame(Instant.now(), reads, confidence, variants);
    }

    private void runControlledRegressionCycle(long now) {
        workers.submit(() -> simulateSoftIrqUserStarvation(now));
        workers.submit(() -> simulateTransparentHugePageDefrag(now));
        workers.submit(() -> simulateSsdIopsCliff(now));
        workers.submit(() -> simulateVmExitOverhead(now));
        workers.submit(() -> simulateTlbFlushStorm(now));
        workers.submit(() -> simulateInterruptAffinitySkew(now));
        workers.submit(() -> simulateRingBusSaturation(now));
        workers.submit(() -> simulateFilesystemJournalBacklog(now));
        workers.submit(() -> simulateThpAllocationStall(now));
        workers.submit(() -> simulateGpuKernelLaunchOverhead(now));
        workers.submit(() -> simulateDirectReclaimDelay(now));
    }

    private void simulateSoftIrqUserStarvation(long now) {
        if (now % 3 != 0) return;
        long start = System.nanoTime();
        burnCpu(22_000 + (long) (requestedIntensity * 38_000));
        hit("softirq", latencyMs(start));
    }

    private void simulateTransparentHugePageDefrag(long now) {
        if (now % 8 != 0) return;
        long start = System.nanoTime();
        byte[] genomeMap = new byte[(int) (2_000_000 + requestedIntensity * 4_000_000)];
        for (int i = 0; i < genomeMap.length; i += 4096) {
            genomeMap[i] = (byte) (i % 127);
        }
        sleepQuietly((long) (90 + requestedIntensity * 220));
        hit("thp-defrag", latencyMs(start));
    }

    private void simulateSsdIopsCliff(long now) {
        if (now % 5 != 0) return;
        long start = System.nanoTime();
        Path log = dataDir.resolve("logs").resolve("analysis-" + runId.get() + ".log");
        try {
            Files.writeString(log, "variant-window=" + now + ",depth=" + (120 + now % 70) + System.lineSeparator(),
                    java.nio.file.StandardOpenOption.CREATE, java.nio.file.StandardOpenOption.APPEND);
            sleepQuietly((long) (70 + requestedIntensity * 180));
        } catch (IOException ignored) {
            sleepQuietly(120);
        }
        hit("ssd-iops", latencyMs(start));
    }

    private void simulateVmExitOverhead(long now) {
        if (now % 4 != 0) return;
        long start = System.nanoTime();
        for (int i = 0; i < 900 + requestedIntensity * 2400; i++) {
            ManagementFactory.getRuntimeMXBean().getUptime();
        }
        hit("vm-exit", latencyMs(start));
    }

    private void simulateTlbFlushStorm(long now) {
        if (now % 6 != 0) return;
        long start = System.nanoTime();
        ByteBuffer shared = ByteBuffer.allocateDirect((int) (512_000 + requestedIntensity * 1_500_000));
        for (int i = 0; i < shared.capacity(); i += 4096) {
            shared.put(i, (byte) 7);
        }
        sleepQuietly((long) (45 + requestedIntensity * 150));
        hit("tlb-flush", latencyMs(start));
    }

    private void simulateInterruptAffinitySkew(long now) {
        if (now % 2 != 0) return;
        long start = System.nanoTime();
        burnCpu(12_000 + (long) (requestedIntensity * 25_000));
        hit("irq-affinity", latencyMs(start));
    }

    private void simulateRingBusSaturation(long now) {
        if (now % 7 != 0) return;
        long start = System.nanoTime();
        byte[] packet = new byte[(int) (1_000_000 + requestedIntensity * 2_500_000)];
        for (int i = 0; i < packet.length; i += 64) {
            packet[i] = (byte) (packet.length - i);
        }
        hit("ring-bus", latencyMs(start));
    }

    private void simulateFilesystemJournalBacklog(long now) {
        if (now % 9 != 0) return;
        long start = System.nanoTime();
        Path dir = dataDir.resolve("micro-results").resolve(runId.get());
        try {
            Files.createDirectories(dir);
            int files = (int) (60 + requestedIntensity * 180);
            for (int i = 0; i < files; i++) {
                Files.writeString(dir.resolve("variant-" + now + "-" + i + ".gxv"), "chr7\t" + i + "\tSNP\n");
            }
        } catch (IOException ignored) {
            sleepQuietly(80);
        }
        hit("fs-journal", latencyMs(start));
    }

    private void simulateThpAllocationStall(long now) {
        if (now % 10 != 0) return;
        long start = System.nanoTime();
        sleepQuietly((long) (180 + requestedIntensity * 420));
        hit("thp-alloc", latencyMs(start));
    }

    private void simulateGpuKernelLaunchOverhead(long now) {
        if (now % 3 != 1) return;
        long start = System.nanoTime();
        for (int launch = 0; launch < 420 + requestedIntensity * 1400; launch++) {
            Math.sin(launch * 0.001);
        }
        hit("gpu-launch", latencyMs(start));
    }

    private void simulateDirectReclaimDelay(long now) {
        if (now % 11 != 0) return;
        long start = System.nanoTime();
        List<byte[]> pressure = new ArrayList<>();
        for (int i = 0; i < 6 + requestedIntensity * 10; i++) {
            pressure.add(new byte[512_000]);
        }
        sleepQuietly((long) (100 + requestedIntensity * 260));
        hit("direct-reclaim", latencyMs(start));
    }

    private void aggregateTelemetry() {
        double severity = bottlenecks.values().stream().mapToDouble(BottleneckState::severity).average().orElse(0.0);
        throughput = Math.max(8.5, 74.0 - severity * 53.0 + ThreadLocalRandom.current().nextDouble(-1.5, 1.5));
        p95Latency = 40 + severity * 850 + ThreadLocalRandom.current().nextDouble(0, 80);
        cpuCore0 = Math.min(99.0, 52 + severity * 48);
        cpuOthers = Math.max(11.0, 44 - severity * 16);
        memoryPressure = Math.min(98.0, 35 + severity * 64);
        iops = Math.max(850, 22000 - severity * 19100);
        gpuLaunchRate = 1200 + severity * 9400;
    }

    private void idleTelemetry() {
        throughput = 0;
        p95Latency = 18;
        cpuCore0 = 9;
        cpuOthers = 6;
        memoryPressure = 22;
        iops = 18500;
        gpuLaunchRate = 0;
    }

    private void hit(String id, long latencyMs) {
        BottleneckState state = bottlenecks.get(id);
        if (state == null) return;
        state.lastLatencyMs.set(latencyMs);
        state.occurrences.incrementAndGet();
        state.decayingSeverity = Math.min(1.0, state.decayingSeverity * 0.82 + requestedIntensity * 0.28 + latencyMs / 1800.0);
    }

    private long latencyMs(long startNs) {
        return Math.max(1, (System.nanoTime() - startNs) / 1_000_000);
    }

    private void burnCpu(long micros) {
        long until = System.nanoTime() + micros * 1_000;
        double sink = 1.0;
        while (System.nanoTime() < until) {
            sink = Math.sqrt(sink + 3.14159);
        }
        if (sink == 42.0) {
            throw new IllegalStateException("unreachable");
        }
    }

    private void sleepQuietly(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private void registerBottlenecks() {
        add("softirq", "SoftIRQ 역설과 유저 모드 아사", "Kernel scheduler", "ksoftirqd 과점으로 분석 워커가 런큐에서 밀림", "시퀀서 네트워크 버스트 유입", 0.54);
        add("thp-defrag", "THP 디프래그 중단", "Memory manager", "거대 유전자 지도 적재 중 간헐 정지", "whole-genome reference map 로딩", 0.49);
        add("ssd-iops", "SSD IOPS 급락", "Block I/O", "로그 쓰기 임계치 후 IOPS 1/10 하락", "분석 로그 누적 플러시", 0.57);
        add("vm-exit", "가상화 VM Exit 과부하", "Virtualization", "장치 접근마다 호스트/게스트 전환 비용 증가", "가상 장비 센서 폴링", 0.46);
        add("tlb-flush", "TLB 플러시 폭풍", "MMU", "공유 영역 권한 변경으로 코어 간 shootdown 증가", "공유 변이 캐시 보호 모드 변경", 0.52);
        add("irq-affinity", "인터럽트 Affinity 불균형", "Interrupt routing", "0번 코어에 장치 인터럽트가 집중", "장비 NIC, NVMe IRQ 편향", 0.61);
        add("ring-bus", "CPU 링 버스 포화", "CPU interconnect", "코어 간 게놈 청크 교환 대역폭 한계", "분산 haplotype merge", 0.5);
        add("fs-journal", "파일 시스템 저널 정체", "Filesystem", "소형 결과 파일 폭증으로 저널 큐 적체", "마이크로 변이 파일 대량 생성", 0.55);
        add("thp-alloc", "THP 할당 스톨", "Memory allocation", "동기 거대 페이지 할당 시 수 초 응답 정지", "대형 annotation matrix 할당", 0.58);
        add("gpu-launch", "GPU 커널 론치 오버헤드", "GPU runtime", "초소형 커널 반복 호출로 런치 비용이 연산 초과", "read-quality micro batch 처리", 0.43);
        add("direct-reclaim", "Direct Reclaim 지연", "Memory pressure", "프로세스가 직접 메모리 회수하며 할당 지연", "coverage tensor burst allocation", 0.56);
    }

    private void add(String id, String name, String layer, String symptom, String trigger, double initialSeverity) {
        bottlenecks.put(id, new BottleneckState(new Bottleneck(id, name, layer, symptom, trigger, initialSeverity, 0, 0), initialSeverity));
    }

    private static final class BottleneckState {
        private final Bottleneck definition;
        private final AtomicLong lastLatencyMs = new AtomicLong();
        private final AtomicLong occurrences = new AtomicLong();
        private volatile double decayingSeverity;

        private BottleneckState(Bottleneck definition, double decayingSeverity) {
            this.definition = definition;
            this.decayingSeverity = decayingSeverity;
        }

        private double severity() {
            decayingSeverity = Math.max(0.12, decayingSeverity * 0.965);
            return decayingSeverity;
        }

        private Bottleneck toBottleneck() {
            return new Bottleneck(
                    definition.id(),
                    definition.name(),
                    definition.layer(),
                    definition.symptom(),
                    definition.businessTrigger(),
                    severity(),
                    lastLatencyMs.get(),
                    occurrences.get()
            );
        }
    }
}
