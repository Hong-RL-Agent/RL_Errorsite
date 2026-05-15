package repair.cosmic.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class RepairController {
    @GetMapping("/status")
    ResponseEntity<Map<String, Object>> status() {
        return ResponseEntity.ok(Map.of(
                "service", "COSMIC-REPAIR",
                "port", 9086,
                "mode", "regression-simulation",
                "signals", List.of("webgl", "dom-pressure", "webrtc-delay", "z-index-collision"),
                "timestamp", Instant.now().toString()
        ));
    }

    @PostMapping("/repairs")
    ResponseEntity<Map<String, Object>> createRepair(@RequestBody RepairRequest request) throws InterruptedException {
        Thread.sleep(180);
        return ResponseEntity.accepted().body(Map.of(
                "accepted", true,
                "ticketId", "CR-" + UUID.randomUUID(),
                "shipCode", request.shipCode(),
                "component", request.component(),
                "receivedAt", Instant.now().toString()
        ));
    }

    record RepairRequest(String shipCode, String component, String requestedAt) {
    }
}
