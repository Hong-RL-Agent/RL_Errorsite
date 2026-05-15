package lab.lexai.simulation;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Repository;

@Repository
public class TrimFreezeRepository {
    private final LabMetrics metrics;
    private final List<Map<String, Object>> writes = new ArrayList<>();

    public TrimFreezeRepository(LabMetrics metrics) {
        this.metrics = metrics;
    }

    public synchronized Map<String, Object> writeCase(String title, String payload) throws InterruptedException {
        long writeNumber = metrics.nextDbWrite();
        boolean trimFreeze = writeNumber % 10 == 0;
        if (trimFreeze) {
            metrics.markTrimFreeze();
            Thread.sleep(3000);
        }
        Map<String, Object> row = Map.of(
                "id", writeNumber,
                "title", title,
                "bytes", payload.length(),
                "trimFreeze", trimFreeze,
                "createdAt", Instant.now().toString()
        );
        writes.add(row);
        return row;
    }
}
