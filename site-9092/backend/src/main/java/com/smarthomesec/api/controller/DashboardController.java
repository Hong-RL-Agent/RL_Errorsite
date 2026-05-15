package com.smarthomesec.api.controller;

import com.smarthomesec.api.model.DeviceStatus;
import com.smarthomesec.api.model.SecurityEvent;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class DashboardController {
    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of(
                "service", "SMART-HOME-SEC",
                "port", 9092,
                "status", "operational",
                "simulationMode", true
        );
    }

    @GetMapping("/devices")
    public List<DeviceStatus> devices() {
        return List.of(
                new DeviceStatus("door-main", "Main Door Lock", "doorlock", "Entry", "locked", 91, true, 0.98),
                new DeviceStatus("cam-garage", "Garage CCTV", "camera", "Garage", "streaming", 76, false, 0.93),
                new DeviceStatus("thermo-hall", "Hallway Climate", "thermostat", "Hallway", "cooling", 88, false, 0.89),
                new DeviceStatus("light-kitchen", "Kitchen Light Rail", "lighting", "Kitchen", "adaptive", 100, false, 0.96)
        );
    }

    @GetMapping("/sessions")
    public List<Map<String, Object>> sessions() {
        return List.of(
                Map.of("user", "owner@smart-home-sec.local", "role", "OWNER", "device", "iPhone 15 Pro", "risk", "low", "active", true),
                Map.of("user", "guest@smart-home-sec.local", "role", "GUEST", "device", "Chrome on Windows", "risk", "medium", "active", true),
                Map.of("user", "automation-bot", "role", "SERVICE", "device", "HomeHub v4", "risk", "low", "active", true)
        );
    }

    @GetMapping("/events")
    public List<SecurityEvent> events() {
        Instant now = Instant.now();
        return List.of(
                new SecurityEvent(now.minusSeconds(7), "INFO", "CCTV", "Garage camera heartbeat accepted"),
                new SecurityEvent(now.minusSeconds(19), "WARN", "OAuth", "Social login callback accepted without state validation"),
                new SecurityEvent(now.minusSeconds(31), "CRITICAL", "JWT", "Token header alg=none accepted in training verifier"),
                new SecurityEvent(now.minusSeconds(45), "WARN", "Download", "Symlink-aware download request observed"),
                new SecurityEvent(now.minusSeconds(60), "INFO", "DoorLock", "Entry lock status synchronized")
        );
    }
}
