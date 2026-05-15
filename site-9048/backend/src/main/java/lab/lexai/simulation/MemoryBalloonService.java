package lab.lexai.simulation;

import jakarta.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.stereotype.Service;

@Service
public class MemoryBalloonService {
    private final LabMetrics metrics;
    private final List<byte[]> balloon = new ArrayList<>();

    public MemoryBalloonService(LabMetrics metrics) {
        this.metrics = metrics;
    }

    @PostConstruct
    void start() {
        Thread worker = new Thread(this::runLoop, "lex-ai-memory-balloon");
        worker.setDaemon(true);
        worker.start();
    }

    private void runLoop() {
        while (!Thread.currentThread().isInterrupted()) {
            try {
                synchronized (balloon) {
                    if (ThreadLocalRandom.current().nextBoolean() && balloon.size() < 24) {
                        balloon.add(new byte[ThreadLocalRandom.current().nextInt(2, 9) * 1024 * 1024]);
                    } else if (!balloon.isEmpty()) {
                        balloon.remove(ThreadLocalRandom.current().nextInt(balloon.size()));
                    }
                    long bytes = balloon.stream().mapToLong(chunk -> chunk.length).sum();
                    metrics.setMemoryBalloonBytes(bytes);
                }
                Thread.sleep(ThreadLocalRandom.current().nextLong(700, 2200));
            } catch (OutOfMemoryError error) {
                synchronized (balloon) {
                    balloon.clear();
                    metrics.setMemoryBalloonBytes(0);
                }
            } catch (InterruptedException interrupted) {
                Thread.currentThread().interrupt();
            }
        }
    }
}
