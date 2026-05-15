package lab.lexai.simulation;

import jakarta.annotation.PostConstruct;
import java.time.Instant;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.stereotype.Service;

@Service
public class ThermalThrottleService {
    private final LabMetrics metrics;
    private volatile Instant throttledUntil = Instant.EPOCH;

    public ThermalThrottleService(LabMetrics metrics) {
        this.metrics = metrics;
    }

    @PostConstruct
    void start() {
        Thread worker = new Thread(this::runLoop, "lex-ai-gpu-power-governor");
        worker.setDaemon(true);
        worker.start();
    }

    public boolean isThrottled() {
        return Instant.now().isBefore(throttledUntil);
    }

    private void runLoop() {
        while (!Thread.currentThread().isInterrupted()) {
            try {
                boolean throttle = ThreadLocalRandom.current().nextInt(100) < 28;
                if (throttle) {
                    throttledUntil = Instant.now().plusSeconds(ThreadLocalRandom.current().nextLong(3, 8));
                    metrics.setComputePower(30);
                    Thread.sleep(ThreadLocalRandom.current().nextLong(3000, 8000));
                } else {
                    metrics.setComputePower(100);
                    Thread.sleep(ThreadLocalRandom.current().nextLong(1500, 4200));
                }
            } catch (InterruptedException interrupted) {
                Thread.currentThread().interrupt();
            }
        }
    }
}
