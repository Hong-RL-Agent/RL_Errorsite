package lab.lexai.simulation;

import java.util.Arrays;
import org.springframework.stereotype.Service;

@Service
public class DocumentIndexingService {
    private final LabMetrics metrics;

    public DocumentIndexingService(LabMetrics metrics) {
        this.metrics = metrics;
    }

    public IndexResult index(String document) throws InterruptedException {
        int size = Math.max(32 * 1024 * 1024, document.length() * 2048);
        byte[] source = new byte[size];
        Arrays.fill(source, (byte) 7);
        byte[] target = new byte[size];
        long start = System.nanoTime();
        for (int i = 0; i < 8; i++) {
            System.arraycopy(source, 0, target, 0, source.length);
        }
        Thread.sleep(1000);
        metrics.markIndexingStutter();
        long elapsedMs = (System.nanoTime() - start) / 1_000_000L;
        return new IndexResult(size, elapsedMs, "THP compaction stutter injected after large memory copies");
    }

    public record IndexResult(int copiedBytes, long elapsedMs, String simulation) {
    }
}
