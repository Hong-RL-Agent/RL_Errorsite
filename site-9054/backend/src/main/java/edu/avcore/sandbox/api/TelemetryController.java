package edu.avcore.sandbox.api;

import edu.avcore.sandbox.model.RegressionSignal;
import edu.avcore.sandbox.model.TelemetrySnapshot;
import edu.avcore.sandbox.regression.V2XSystemInterceptor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
public class TelemetryController {
    private final V2XSystemInterceptor interceptor;

    public TelemetryController(V2XSystemInterceptor interceptor) {
        this.interceptor = interceptor;
    }

    @GetMapping("/telemetry")
    public TelemetrySnapshot telemetry() {
        return interceptor.snapshot();
    }

    @GetMapping("/regressions")
    public List<RegressionSignal> regressions() {
        return interceptor.regressions();
    }

    @PostMapping("/regressions/{id}/toggle")
    public ResponseEntity<RegressionSignal> toggle(@PathVariable String id) {
        return interceptor.toggle(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
