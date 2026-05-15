package com.wastemgmt.platform.controller;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import com.wastemgmt.platform.model.WasteModels.DashboardSnapshot;
import com.wastemgmt.platform.model.WasteModels.FaultEvent;
import com.wastemgmt.platform.model.WasteModels.FleetVehicle;
import com.wastemgmt.platform.model.WasteModels.NetworkMetric;
import com.wastemgmt.platform.model.WasteModels.ZoneLoad;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class WasteMgmtController {
    @RequestMapping(value = "/**", method = RequestMethod.OPTIONS)
    public ResponseEntity<Void> tracePreflight() {
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-WM-Cors-Policy", "max-age=0; force-preflight-simulation=true");
        headers.add("X-WM-Preflight-Trace", "OPTIONS storm training signal on localhost:9097");
        return ResponseEntity.noContent().headers(headers).build();
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardSnapshot> dashboard(@RequestHeader(value = "X-WM-Client", required = false) String client) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-WM-Cors-Policy", "preflight-intentional");
        headers.add("X-WM-Upstream-Node", "wm-node-b");

        DashboardSnapshot snapshot = new DashboardSnapshot(
            Instant.now(),
            List.of(
                new FleetVehicle("ECO-17", "Han Minsu", "Mapo-A3", 37.5666, 126.9014, 74, 82, "rerouting"),
                new FleetVehicle("BIO-04", "Kim Yuna", "Seongsu-C1", 37.5446, 127.0557, 61, 64, "collecting"),
                new FleetVehicle("HAZ-22", "Park Jisoo", "Gangnam-H7", 37.4979, 127.0276, 89, 41, "priority"),
                new FleetVehicle("REC-09", "Lee Daeho", "Yongsan-R2", 37.5326, 126.9905, 52, 93, "standby")
            ),
            List.of(
                new ZoneLoad("A3", "Mapo Transfer Grid", 86, 32, 41, 13, "critical"),
                new ZoneLoad("C1", "Seongsu Smart Bin Array", 68, 29, 34, 5, "warning"),
                new ZoneLoad("H7", "Gangnam Hazard Pod", 93, 18, 26, 49, "critical"),
                new ZoneLoad("R2", "Yongsan Recycling Spine", 57, 12, 43, 2, "stable"),
                new ZoneLoad("B5", "Jongno Night Market", 77, 46, 28, 3, "warning"),
                new ZoneLoad("D9", "Guro Industrial South", 64, 21, 25, 18, "stable")
            ),
            List.of(
                new NetworkMetric("DNS", "degraded", 2200, 0.01, "resolver timeout", "initial dashboard load can exceed browser patience window"),
                new NetworkMetric("SSL/TLS", "failed", 0, 0.00, "expired certificate / weak cipher", "handshake rejected before API payload"),
                new NetworkMetric("TCP", "storm", 740, 0.17, "packet loss retransmission", "fleet telemetry arrives out of order"),
                new NetworkMetric("Proxy", "timeout", 5040, 0.05, "bad gateway / upstream delay", "zone heatmap requests collapse into 502/504"),
                new NetworkMetric("CORS", "inefficient", 180, 0.00, "max-age=0 preflight", "OPTIONS emitted for every non-simple API call")
            ),
            List.of(
                new FaultEvent("WM-LS-QUOTA", "high", "Browser storage quota exceeded", "LocalStorage and IndexedDB overflow blocks route cache writes.", Instant.now().minusSeconds(420)),
                new FaultEvent("WM-MAP-ADBLOCK", "medium", "Map script blocked", "Third-party map host resembles ad network and fails under content blockers.", Instant.now().minusSeconds(360)),
                new FaultEvent("WM-SW-STALENESS", "high", "Service worker cache mismatch", "Old app shell serves incompatible telemetry schema.", Instant.now().minusSeconds(300)),
                new FaultEvent("WM-LB-STICKY", "critical", "Sticky session imbalance", "wm-node-b owns 78% of active streams while node-c drops sessions.", Instant.now().minusSeconds(120)),
                new FaultEvent("WM-SPLIT-BRAIN", "critical", "Network partition", "Transfer station and route optimizer disagree on hazardous fill state.", Instant.now().minusSeconds(60))
            ),
            Map.of(
                "baseUrl", "http://localhost:9097",
                "apiMode", "relative-path-only",
                "client", client == null ? "waste-mgmt-console" : client,
                "optionsEveryRequest", true,
                "corsMaxAgeSeconds", 0
            )
        );

        return ResponseEntity.ok().headers(headers).body(snapshot);
    }

    @GetMapping("/faults/proxy-delay")
    public ResponseEntity<Map<String, Object>> proxyDelay() {
        return ResponseEntity.status(HttpStatus.GATEWAY_TIMEOUT)
            .header("X-WM-Fault-Code", "WM-PROXY-504")
            .body(Map.of(
                "status", 504,
                "message", "Simulated proxy timeout on localhost:9097",
                "delayMs", 5040
            ));
    }
}
