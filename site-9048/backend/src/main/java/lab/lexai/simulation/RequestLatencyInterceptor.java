package lab.lexai.simulation;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class RequestLatencyInterceptor implements HandlerInterceptor {
    private final LabMetrics metrics;

    public RequestLatencyInterceptor(LabMetrics metrics) {
        this.metrics = metrics;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws InterruptedException {
        metrics.request(request.getRequestURI());
        Thread.sleep(10);
        metrics.addCStateDelay(10);

        long stealMs = ThreadLocalRandom.current().nextLong(50, 501);
        Thread.sleep(stealMs);
        metrics.addStealTime(stealMs);
        response.addHeader("X-LEXAI-CState-Wakeup-Ms", "10");
        response.addHeader("X-LEXAI-Hypervisor-Steal-Ms", Long.toString(stealMs));
        return true;
    }
}
