package lab.lexai.simulation;

import java.util.Locale;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeoutException;
import org.springframework.stereotype.Service;

@Service
public class GpuInferenceService {
    private final LabMetrics metrics;
    private final ThermalThrottleService thermalThrottleService;
    private String activeModel = "Criminal";

    public GpuInferenceService(LabMetrics metrics, ThermalThrottleService thermalThrottleService) {
        this.metrics = metrics;
        this.thermalThrottleService = thermalThrottleService;
    }

    public synchronized InferenceResult infer(String requestedModel, String prompt)
            throws InterruptedException, TimeoutException {
        String model = normalizeModel(requestedModel);
        long latency = ThreadLocalRandom.current().nextLong(80, 180);
        boolean switched = !activeModel.equals(model);
        if (switched) {
            Thread.sleep(200);
            latency += 200;
            activeModel = model;
            metrics.markGpuSwitch(model);
        } else {
            metrics.setActiveModel(model);
        }

        if (thermalThrottleService.isThrottled() && ThreadLocalRandom.current().nextInt(100) < 42) {
            Thread.sleep(1200);
            metrics.markTimeout();
            throw new TimeoutException("GPU thermal/power throttling forced inference timeout");
        }

        Thread.sleep(latency);
        String answer = "LEX-AI " + model + " model reviewed " + Math.max(1, prompt.length() / 9)
                + " legal factors and produced a risk-ranked consultation draft.";
        return new InferenceResult(model, switched, latency, answer);
    }

    private String normalizeModel(String requestedModel) {
        if (requestedModel == null) {
            return "Criminal";
        }
        String value = requestedModel.trim().toLowerCase(Locale.ROOT);
        return value.startsWith("civil") ? "Civil" : "Criminal";
    }

    public record InferenceResult(String model, boolean contextSwitched, long latencyMs, String answer) {
    }
}
