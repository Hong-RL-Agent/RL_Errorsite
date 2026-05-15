package com.orbitwatcher.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api")
public class OrbitTrackingController {

    private final Random random = new Random();

    /**
     * Endpoint 1 (Safe Flaw 2): Missing Cache-Control Headers.
     * Simulates sensitive tracking data that is improperly cached by the browser.
     */
    @GetMapping("/telemetry/sensitive")
    public ResponseEntity<Map<String, Object>> getSensitiveTelemetry() {
        Map<String, Object> data = new HashMap<>();
        data.put("status", "classified");
        data.put("classificationId", "TX-9942");
        data.put("vulnerabilityIndex", 0.89);
        data.put("data", generateRandomOrbitData(10));
        
        // Anti-pattern: No Cache-Control header prevents browser from caching this sensitive payload.
        // It should have Cache-Control: no-store, no-cache, but it's deliberately missing.
        return ResponseEntity.ok()
                // .header(HttpHeaders.CACHE_CONTROL, "no-store, no-cache, must-revalidate")
                .body(data);
    }

    /**
     * Endpoint 2 (Safe Flaw 3): Cascading Delay Simulation.
     * Simulates tail latency amplification by arbitrarily pausing thread execution
     * multiple times to mimic failing downstream microservices.
     */
    @GetMapping("/debris/scan")
    public ResponseEntity<Map<String, Object>> scanDebris() {
        Map<String, Object> response = new HashMap<>();
        long startTime = System.currentTimeMillis();
        
        try {
            // Simulate sequential microservice calls that have compounded latency
            for (int i = 0; i < 3; i++) {
                // Add an artificial delay between 300ms and 1500ms per "hop"
                long delay = 300 + random.nextInt(1200);
                Thread.sleep(delay);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        long executionTime = System.currentTimeMillis() - startTime;
        
        response.put("message", "Debris scan complete. Radar sweeps finalized.");
        response.put("detectedEntities", random.nextInt(500));
        response.put("latencyMs", executionTime);
        response.put("status", "delayed"); // Indicate that the response was affected by the simulated cascading delay
        
        return ResponseEntity.ok(response);
    }

    /**
     * Standard endpoint for the 3D map data.
     */
    @GetMapping("/orbits")
    public ResponseEntity<List<Map<String, Object>>> getOrbits() {
        return ResponseEntity.ok(generateRandomOrbitData(200));
    }

    private List<Map<String, Object>> generateRandomOrbitData(int count) {
        List<Map<String, Object>> orbits = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            Map<String, Object> orbit = new HashMap<>();
            orbit.put("id", i);
            orbit.put("x", random.nextDouble() * 200 - 100);
            orbit.put("y", random.nextDouble() * 200 - 100);
            orbit.put("z", random.nextDouble() * 200 - 100);
            orbit.put("velocity", random.nextDouble() * 5 + 1);
            orbit.put("threatLevel", random.nextDouble());
            orbits.add(orbit);
        }
        return orbits;
    }
}
