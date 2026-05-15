package lab.lexai.simulation;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import org.springframework.stereotype.Service;

@Service
public class InterruptCoalescenceService {
    private static final int BATCH_SIZE = 5;
    private final LabMetrics metrics;
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
    private final List<CompletableFuture<BatchResult>> waiting = new ArrayList<>();

    public InterruptCoalescenceService(LabMetrics metrics) {
        this.metrics = metrics;
    }

    public CompletableFuture<BatchResult> waitForBatch() {
        CompletableFuture<BatchResult> future = new CompletableFuture<>();
        synchronized (waiting) {
            waiting.add(future);
            if (waiting.size() == 1) {
                scheduler.schedule(this::flush, 2500, TimeUnit.MILLISECONDS);
            }
            if (waiting.size() >= BATCH_SIZE) {
                flush();
            }
        }
        return future;
    }

    private void flush() {
        List<CompletableFuture<BatchResult>> batch;
        synchronized (waiting) {
            if (waiting.isEmpty()) {
                return;
            }
            batch = new ArrayList<>(waiting);
            waiting.clear();
        }
        metrics.addBatchedRequests(batch.size());
        BatchResult result = new BatchResult(batch.size(), BATCH_SIZE, Instant.now().toString());
        batch.forEach(future -> future.complete(result));
    }

    public record BatchResult(int releasedRequests, int targetBatchSize, String releasedAt) {
    }
}
