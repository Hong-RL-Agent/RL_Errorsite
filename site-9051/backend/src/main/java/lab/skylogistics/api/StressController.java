package lab.skylogistics.api;

import java.util.List;
import java.util.Map;

import lab.skylogistics.model.FleetSnapshot;
import lab.skylogistics.model.RegressionEvent;
import lab.skylogistics.service.SystemStressService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class StressController {
    private final SystemStressService stressService;

    public StressController(SystemStressService stressService) {
        this.stressService = stressService;
    }

    @GetMapping("/api/fleet")
    public FleetSnapshot fleet() {
        return stressService.snapshot();
    }

    @GetMapping("/api/regressions")
    public List<RegressionEvent> regressions() {
        return stressService.regressions();
    }

    @PostMapping("/api/regressions/{id}/trigger")
    public ResponseEntity<RegressionEvent> trigger(@PathVariable String id) {
        return stressService.trigger(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/api/regressions/reset")
    public Map<String, Object> reset() {
        stressService.reset();
        return Map.of("status", "reset");
    }
}
