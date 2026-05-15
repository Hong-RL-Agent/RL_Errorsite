package lab.trustvote.service;

import lab.trustvote.model.BatchDeleteResponse;
import lab.trustvote.model.CastVoteRequest;
import lab.trustvote.model.LedgerTransaction;
import lab.trustvote.model.RegressionReport;
import lab.trustvote.model.SecuritySnapshot;
import lab.trustvote.model.VoteReceipt;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.locks.ReentrantLock;

@Service
public class BlockchainSimService {
    private final Queue<LedgerTransaction> ledger = new ConcurrentLinkedDeque<>();
    private final Map<String, Integer> tally = new ConcurrentHashMap<>();
    private final Map<Integer, RegressionState> regressions = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(4, task -> {
        Thread thread = new Thread(task, "trust-vote-sim");
        thread.setDaemon(true);
        return thread;
    });
    private final ReentrantLock globalVoteMutex = new ReentrantLock(true);
    private final AtomicLong blockHeight = new AtomicLong(43100);
    private final AtomicLong requestCount = new AtomicLong();
    private final AtomicLong totalLatency = new AtomicLong();
    private final AtomicLong minuteVotes = new AtomicLong();
    private final AtomicBoolean writebackErrorPending = new AtomicBoolean();
    private final AtomicBoolean gpuImplicitSyncStalled = new AtomicBoolean();
    private final AtomicBoolean memoryCompactionLivelock = new AtomicBoolean();
    private volatile boolean journalMirroringEnabled = true;

    private final int processCore;
    private final int networkInterruptCore;
    private final int ioChannelMbps;

    public BlockchainSimService(
            @Value("${trust-vote.process-core:0}") int processCore,
            @Value("${trust-vote.network-interrupt-core:1}") int networkInterruptCore,
            @Value("${trust-vote.io-channel-mbps:80}") int ioChannelMbps
    ) {
        this.processCore = processCore;
        this.networkInterruptCore = networkInterruptCore;
        this.ioChannelMbps = ioChannelMbps;
        seedRegressions();
        seedLedger();
    }

    public VoteReceipt castVote(CastVoteRequest request) {
        long started = System.nanoTime();
        long count = requestCount.incrementAndGet();
        List<String> applied = new ArrayList<>();

        sleep(100);
        touch(1, 100, "ACTIVE");
        applied.add("TLB shootdown: 100ms cross-core invalidation");

        runLockConvoy(applied);
        runGpuImplicitSync(applied);
        runNumaHop(request, applied);
        runInterruptImbalance(applied);

        if (count % 50 == 0) {
            sleep(300);
            touch(7, 300, "ECC CORRECTED");
            applied.add("ECC correction: 300ms multi-bit correction latency");
        }

        long diskPenalty = writeJournal(applied);
        scheduleMaskedWritebackError();

        String receiptId = "TRUST-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        long height = blockHeight.incrementAndGet();
        String hash = hash(receiptId + height + request.candidate() + request.precinct());
        long latencyMs = elapsedMs(started) + diskPenalty;
        tally.merge(request.candidate(), 1, Integer::sum);
        totalLatency.addAndGet(latencyMs);
        minuteVotes.incrementAndGet();

        LedgerTransaction tx = new LedgerTransaction(
                receiptId,
                height,
                hash.substring(0, 18),
                request.candidate(),
                request.precinct(),
                writebackErrorPending.get() ? "WRITEBACK-PENDING" : "COMMITTED",
                latencyMs,
                Instant.now()
        );
        ledger.add(tx);
        trimLedger();

        return new VoteReceipt(receiptId, tx.hash(), height, latencyMs, true, tx.state(), tx.timestamp(), applied);
    }

    public BatchDeleteResponse batchDeleteOldSessions() {
        touch(8, 5000, "I/O FROZEN");
        sleep(5000);
        return new BatchDeleteResponse("GC-" + UUID.randomUUID(), "SSD GC freeze completed", 5000, Instant.now());
    }

    public RegressionReport triggerRegression(int id) {
        switch (id) {
            case 3 -> {
                gpuImplicitSyncStalled.set(true);
                scheduler.schedule(() -> gpuImplicitSyncStalled.set(false), 1500, TimeUnit.MILLISECONDS);
                touch(3, 1500, "GPU FENCE WAIT");
            }
            case 5 -> verifyTallyWithShaderThrash();
            case 10 -> {
                memoryCompactionLivelock.set(true);
                touch(10, 8000, "LIVELOCK");
                scheduler.schedule(() -> memoryCompactionLivelock.set(false), 8, TimeUnit.SECONDS);
            }
            case 11 -> {
                journalMirroringEnabled = !journalMirroringEnabled;
                touch(11, journalMirroringEnabled ? 100 : 0, journalMirroringEnabled ? "MIRRORING ON" : "MIRRORING OFF");
            }
            default -> {
                RegressionState state = regressions.get(id);
                if (state != null) {
                    state.status = "MANUAL TRIGGERED";
                    state.lastTriggeredAt = Instant.now();
                }
            }
        }
        return regressions.get(id).report();
    }

    public List<LedgerTransaction> recentLedger() {
        return ledger.stream()
                .sorted(Comparator.comparing(LedgerTransaction::height).reversed())
                .limit(32)
                .toList();
    }

    public SecuritySnapshot snapshot() {
        long count = Math.max(1, requestCount.get());
        Map<String, Long> subsystem = new LinkedHashMap<>();
        subsystem.put("tlbShootdown", regressions.get(1).penaltyMs);
        subsystem.put("globalMutex", regressions.get(2).penaltyMs);
        subsystem.put("gpuFence", regressions.get(3).penaltyMs);
        subsystem.put("writebackMask", regressions.get(4).penaltyMs);
        subsystem.put("numaHop", regressions.get(9).penaltyMs);
        subsystem.put("journalMirror", regressions.get(11).penaltyMs);

        return new SecuritySnapshot(
                blockHeight.get(),
                120 + (int) (requestCount.get() % 34),
                totalLatency.get() / count,
                minuteVotes.get(),
                writebackErrorPending.get(),
                gpuImplicitSyncStalled.get(),
                memoryCompactionLivelock.get(),
                journalMirroringEnabled,
                new LinkedHashMap<>(tally),
                subsystem,
                Instant.now()
        );
    }

    public List<RegressionReport> regressionReports() {
        return regressions.values().stream()
                .sorted(Comparator.comparingInt(RegressionState::id))
                .map(RegressionState::report)
                .toList();
    }

    @Scheduled(fixedRate = 60_000)
    void resetMinuteThroughput() {
        minuteVotes.set(0);
    }

    private void runLockConvoy(List<String> applied) {
        touch(2, 0, "QUEUED");
        for (int i = 0; i < 6; i++) {
            scheduler.execute(() -> {
                globalVoteMutex.lock();
                try {
                    sleep(45);
                } finally {
                    globalVoteMutex.unlock();
                }
            });
        }
        globalVoteMutex.lock();
        try {
            sleep(160);
            touch(2, 160, "CONVOY");
            applied.add("Lock convoy: fair global mutex queue inserted 160ms jitter");
        } finally {
            globalVoteMutex.unlock();
        }
    }

    private void runGpuImplicitSync(List<String> applied) {
        gpuImplicitSyncStalled.set(true);
        sleep(140);
        touch(3, 140, "IMPLICIT SYNC");
        gpuImplicitSyncStalled.set(false);
        applied.add("GPU implicit sync: CPU waited for background encryption fence");
    }

    private void runNumaHop(CastVoteRequest request, List<String> applied) {
        boolean remote = "remote".equalsIgnoreCase(request.numaNode()) || request.precinct().hashCode() % 3 == 0;
        long delay = remote ? 200 : 50;
        sleep(delay);
        touch(9, delay, remote ? "REMOTE NODE" : "LOCAL NODE");
        applied.add("NUMA fetch: " + delay + "ms " + (remote ? "remote" : "local") + " voting data hop");
    }

    private void runInterruptImbalance(List<String> applied) {
        if (processCore != networkInterruptCore) {
            sleep(120);
            touch(6, 120, "CROSS-CORE IRQ");
            applied.add("CPU pinning imbalance: process core " + processCore + ", network IRQ core " + networkInterruptCore);
        }
    }

    private long writeJournal(List<String> applied) {
        long baseMs = Math.max(15, 800 / Math.max(1, ioChannelMbps));
        long actual = journalMirroringEnabled ? baseMs * 2 : baseMs;
        sleep(actual);
        touch(11, journalMirroringEnabled ? actual : 0, journalMirroringEnabled ? "BANDWIDTH HALVED" : "SINGLE JOURNAL");
        if (journalMirroringEnabled) {
            applied.add("Journal mirroring: single-channel write bandwidth halved");
        }
        return actual;
    }

    private void scheduleMaskedWritebackError() {
        writebackErrorPending.set(true);
        touch(4, 2000, "MASKED");
        scheduler.schedule(() -> {
            writebackErrorPending.set(false);
            touch(4, 0, "DISK ERROR SURFACED");
            ledger.add(new LedgerTransaction(
                    "WBERR-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase(),
                    blockHeight.get(),
                    "controller-delay",
                    "system",
                    "vote-logger",
                    "WRITEBACK-ERROR-SURFACED",
                    2000,
                    Instant.now()
            ));
            trimLedger();
        }, 2, TimeUnit.SECONDS);
    }

    private void verifyTallyWithShaderThrash() {
        touch(5, 2500, "I-CACHE THRASH");
        sleep(2500);
    }

    private void seedRegressions() {
        add(1, "TLB Shootdown", "Memory", "100ms lag on every vote", 100);
        add(2, "Lock Convoy", "Synchronization", "Global mutex convoy reduces throughput", 160);
        add(3, "GPU Implicit Sync", "GPU", "CPU waits for background encryption fence", 140);
        add(4, "Storage Writeback Error Masking", "Storage", "Success returned before delayed controller error", 2000);
        add(5, "GPU Instruction Cache Thrashing", "GPU", "Tally verification shader slows by 5x", 2500);
        add(6, "CPU Core Pinning Interrupt Imbalance", "Kernel", "Core 0 process, Core 1 interrupts cross-talk", 120);
        add(7, "ECC Memory Correction Latency", "Memory", "Every 50th request adds 300ms correction", 300);
        add(8, "SSD Internal Garbage Collection", "Storage", "Batch delete freezes I/O for 5 seconds", 5000);
        add(9, "NUMA Hop Distance Latency", "Memory", "Local node 50ms, remote node 200ms", 200);
        add(10, "Memory Compaction Livelock", "Kernel", "Huge-page allocation livelock simulation", 8000);
        add(11, "Journal Mirroring Bandwidth Halving", "Storage", "Safety mirroring halves write bandwidth", 100);
    }

    private void seedLedger() {
        tally.put("Ahn", 428);
        tally.put("Baek", 391);
        tally.put("Choi", 365);
        for (int i = 0; i < 12; i++) {
            long height = blockHeight.incrementAndGet();
            ledger.add(new LedgerTransaction(
                    "BOOT-" + (1000 + i),
                    height,
                    hash("boot" + height).substring(0, 18),
                    List.of("Ahn", "Baek", "Choi").get(i % 3),
                    "P-" + (17 + i),
                    "COMMITTED",
                    80 + i * 11L,
                    Instant.now().minusSeconds(60L - i * 3L)
            ));
        }
    }

    private void add(int id, String name, String subsystem, String impact, long penaltyMs) {
        regressions.put(id, new RegressionState(id, name, subsystem, "ARMED", impact, penaltyMs, Instant.now()));
    }

    private void touch(int id, long penaltyMs, String status) {
        RegressionState state = regressions.get(id);
        if (state != null) {
            state.penaltyMs = penaltyMs;
            state.status = status;
            state.lastTriggeredAt = Instant.now();
        }
    }

    private void trimLedger() {
        while (ledger.size() > 80) {
            ledger.poll();
        }
    }

    private long elapsedMs(long started) {
        return TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - started);
    }

    private void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private String hash(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encoded = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder builder = new StringBuilder();
            for (byte b : encoded) {
                builder.append(String.format("%02x", b));
            }
            return builder.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }

    private static final class RegressionState {
        private final int id;
        private final String name;
        private final String subsystem;
        private final String impact;
        private String status;
        private long penaltyMs;
        private Instant lastTriggeredAt;

        private RegressionState(int id, String name, String subsystem, String status, String impact, long penaltyMs, Instant lastTriggeredAt) {
            this.id = id;
            this.name = name;
            this.subsystem = subsystem;
            this.status = status;
            this.impact = impact;
            this.penaltyMs = penaltyMs;
            this.lastTriggeredAt = lastTriggeredAt;
        }

        private int id() {
            return id;
        }

        private RegressionReport report() {
            return new RegressionReport(id, name, subsystem, status, impact, penaltyMs, lastTriggeredAt);
        }
    }
}
