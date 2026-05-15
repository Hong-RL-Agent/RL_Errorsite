package com.smartcity.traffic;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // For development convenience
public class TrafficController {

    // Defect 2: Data Center Region Isolation Error & Defect 3: Response Timeout Delay
    @GetMapping("/traffic/data")
    public ResponseEntity<List<Map<String, Object>>> getTrafficData(
            @RequestHeader(value = "X-Region-Failover", required = false) String regionFailover,
            @RequestParam(value = "simulate_timeout", required = false) Boolean simulateTimeout) throws InterruptedException {
        
        // Defect 3
        if (Boolean.TRUE.equals(simulateTimeout)) {
            Thread.sleep(10000); // 10 seconds delay
        }

        // Defect 2
        if ("true".equalsIgnoreCase(regionFailover)) {
            return ResponseEntity.ok(new ArrayList<>()); // Blank map situation
        }

        // Mock normal data
        List<Map<String, Object>> data = new ArrayList<>();
        data.add(Map.of("id", "c1", "lat", 37.5665, "lng", 126.9780, "status", "congestion", "speed", 15));
        data.add(Map.of("id", "c2", "lat", 37.5651, "lng", 126.9895, "status", "smooth", "speed", 60));
        return ResponseEntity.ok(data);
    }

    // Defect 5: Missing Data Export
    @GetMapping("/export")
    public ResponseEntity<String> exportData() {
        // Intentionally throw a 500 Error without valid implementation
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Internal Server Error: Failed to generate CSV export stream.");
    }

    // Defect 11: Storage Bucket Data Evaporation
    @GetMapping("/logs")
    public ResponseEntity<?> getLogs(@RequestParam(value = "date", required = false) String dateStr) {
        if (dateStr != null) {
            try {
                LocalDate requestDate = LocalDate.parse(dateStr, DateTimeFormatter.ISO_DATE);
                LocalDate sevenDaysAgo = LocalDate.now().minusDays(7);
                if (requestDate.isBefore(sevenDaysAgo)) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(Map.of("error", "File Not Found in Storage Bucket: smart-traffic-logs-" + dateStr + ".log"));
                }
            } catch (Exception e) {
                return ResponseEntity.badRequest().body("Invalid date format. Use YYYY-MM-DD.");
            }
        }
        
        return ResponseEntity.ok(Map.of("log", "System healthy. Region AP-Northeast-2 sync completed."));
    }
}
