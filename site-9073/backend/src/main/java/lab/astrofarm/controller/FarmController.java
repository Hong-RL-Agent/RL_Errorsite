package lab.astrofarm.controller;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/farm")
public class FarmController {
    @GetMapping("/metrics")
    public Map<String, Object> metrics() {
        return Map.of(
                "temperature", 24.8,
                "humidity", 67,
                "co2", 762,
                "light", 88,
                "series", List.of(62, 65, 63, 70, 73, 69, 76, 79, 78, 84, 82, 88),
                "updatedAt", Instant.now().toString());
    }

    @PostMapping("/stop")
    public Map<String, Object> stopCultivation(@RequestParam(defaultValue = "alpha") String chamber) {
        return Map.of(
                "csrfValidated", false,
                "status", "STOP_ACCEPTED_FOR_TRAINING",
                "chamber", chamber,
                "warning", "Important action accepted without CSRF token verification");
    }
}

