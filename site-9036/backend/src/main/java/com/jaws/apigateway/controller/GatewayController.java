package com.jaws.apigateway.controller;

import com.jaws.apigateway.service.ExternalDependencySimulationService;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Map;

@Validated
@RestController
@RequestMapping("/api")
public class GatewayController {

    private final ExternalDependencySimulationService simulationService;

    public GatewayController(ExternalDependencySimulationService simulationService) {
        this.simulationService = simulationService;
    }

    @GetMapping("/dashboard/bootstrap")
    public Map<String, Object> bootstrapDashboard() throws InterruptedException {
        return simulationService.getDashboardOverviewWithCascadingFailure();
    }

    @PostMapping("/faults/110/payment/charge")
    public ResponseEntity<Map<String, Object>> chargePayment(@RequestBody PaymentRequest request) {
        Map<String, Object> result = simulationService.processPayment(request.tenantId(), request.amount());
        boolean limited = Boolean.TRUE.equals(result.get("limited"));
        return limited
                ? ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(result)
                : ResponseEntity.ok(result);
    }

    @GetMapping("/faults/115/provider-profile")
    public Map<String, Object> payloadMismatch() {
        return simulationService.schemaDriftPayload();
    }

    @GetMapping("/faults/120/provider-secret-leak")
    public Map<String, Object> leakedSecrets() {
        return simulationService.leakedSecretPayload();
    }

    public record PaymentRequest(
            @NotBlank String tenantId,
            @DecimalMin(value = "0.01") BigDecimal amount
    ) {
    }
}
