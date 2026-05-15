package lab.lexai.simulation;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Component;

@Component
public class LabMetrics {
    private final AtomicLong totalRequests = new AtomicLong();
    private final AtomicLong cStateDelayMs = new AtomicLong();
    private final AtomicLong stealTimeMs = new AtomicLong();
    private final AtomicLong gpuSwitches = new AtomicLong();
    private final AtomicLong trimFreezes = new AtomicLong();
    private final AtomicLong indexingStutters = new AtomicLong();
    private final AtomicLong openDeletedFiles = new AtomicLong();
    private final AtomicLong memoryBalloonBytes = new AtomicLong();
    private final AtomicLong fragmentedCacheChunks = new AtomicLong();
    private final AtomicLong batchedRequests = new AtomicLong();
    private final AtomicLong timedOutRequests = new AtomicLong();
    private final AtomicLong dbWrites = new AtomicLong();
    private final AtomicInteger computePower = new AtomicInteger(100);
    private final Map<String, AtomicLong> endpointCounts = new ConcurrentHashMap<>();
    private volatile String activeModel = "Criminal";
    private volatile Instant lastUpdated = Instant.now();

    public long request(String path) {
        lastUpdated = Instant.now();
        endpointCounts.computeIfAbsent(path, ignored -> new AtomicLong()).incrementAndGet();
        return totalRequests.incrementAndGet();
    }

    public void addCStateDelay(long ms) {
        cStateDelayMs.addAndGet(ms);
    }

    public void addStealTime(long ms) {
        stealTimeMs.addAndGet(ms);
    }

    public void markGpuSwitch(String model) {
        activeModel = model;
        gpuSwitches.incrementAndGet();
    }

    public void setActiveModel(String model) {
        activeModel = model;
    }

    public void markTrimFreeze() {
        trimFreezes.incrementAndGet();
    }

    public void markIndexingStutter() {
        indexingStutters.incrementAndGet();
    }

    public void setOpenDeletedFiles(long count) {
        openDeletedFiles.set(count);
    }

    public void setMemoryBalloonBytes(long bytes) {
        memoryBalloonBytes.set(bytes);
    }

    public void setFragmentedCacheChunks(long chunks) {
        fragmentedCacheChunks.set(chunks);
    }

    public void addBatchedRequests(long count) {
        batchedRequests.addAndGet(count);
    }

    public void markTimeout() {
        timedOutRequests.incrementAndGet();
    }

    public long nextDbWrite() {
        return dbWrites.incrementAndGet();
    }

    public void setComputePower(int value) {
        computePower.set(value);
    }

    public Map<String, Object> snapshot() {
        Map<String, Long> endpointSnapshot = new ConcurrentHashMap<>();
        endpointCounts.forEach((path, count) -> endpointSnapshot.put(path, count.get()));
        return Map.ofEntries(
                Map.entry("totalRequests", totalRequests.get()),
                Map.entry("cStateDelayMs", cStateDelayMs.get()),
                Map.entry("hypervisorStealTimeMs", stealTimeMs.get()),
                Map.entry("gpuContextSwitches", gpuSwitches.get()),
                Map.entry("activeModel", activeModel),
                Map.entry("ssdTrimFreezes", trimFreezes.get()),
                Map.entry("indexingStutters", indexingStutters.get()),
                Map.entry("openDeletedFiles", openDeletedFiles.get()),
                Map.entry("memoryBalloonBytes", memoryBalloonBytes.get()),
                Map.entry("fragmentedCacheChunks", fragmentedCacheChunks.get()),
                Map.entry("batchedRequests", batchedRequests.get()),
                Map.entry("timedOutRequests", timedOutRequests.get()),
                Map.entry("dbWrites", dbWrites.get()),
                Map.entry("computePower", computePower.get()),
                Map.entry("endpointCounts", endpointSnapshot),
                Map.entry("lastUpdated", lastUpdated.toString())
        );
    }
}
