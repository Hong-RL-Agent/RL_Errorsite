package com.smartport.controller;

import com.smartport.model.ContainerSlot;
import com.smartport.model.DashboardSnapshot;
import com.smartport.model.MemoryTelemetry;
import com.smartport.model.VesselSchedule;
import com.smartport.service.PortTelemetryService;
import com.smartport.service.SecuritySimulationService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class PortOperationsController {
    private final PortTelemetryService telemetryService;
    private final SecuritySimulationService securitySimulationService;

    public PortOperationsController(
            PortTelemetryService telemetryService,
            SecuritySimulationService securitySimulationService) {
        this.telemetryService = telemetryService;
        this.securitySimulationService = securitySimulationService;
    }

    @GetMapping("/dashboard")
    public DashboardSnapshot dashboard() {
        return telemetryService.snapshot();
    }

    @GetMapping("/containers")
    public List<ContainerSlot> containers() {
        return telemetryService.containers();
    }

    @GetMapping("/vessels")
    public List<VesselSchedule> vessels() {
        return telemetryService.schedules();
    }

    @GetMapping("/security/memory")
    public MemoryTelemetry memory() {
        return telemetryService.memoryTelemetry();
    }

    @PostMapping("/simulation/fingerprint")
    public ResponseEntity<Map<String, Object>> fingerprint(HttpServletRequest request) {
        return ResponseEntity.ok()
                .header("X-SMART-PORT-Simulation", "consentless-fingerprint")
                .body(securitySimulationService.collectFingerprintWithoutConsent(request.getHeader("User-Agent")));
    }

    @PostMapping("/simulation/biometric-plaintext")
    public Map<String, Object> biometricPlaintext() {
        return securitySimulationService.persistPlaintextBiometricSample();
    }

    @PostMapping("/simulation/card-log")
    public Map<String, Object> cardLog() {
        return securitySimulationService.logPlaintextCardEvent();
    }

    @PostMapping("/simulation/hipaa-bypass")
    public Map<String, Object> hipaaBypass() {
        return securitySimulationService.hipaaAccessControlBypass();
    }
}
