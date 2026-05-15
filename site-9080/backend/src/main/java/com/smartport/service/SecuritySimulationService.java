package com.smartport.service;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class SecuritySimulationService {
    private static final Logger log = LoggerFactory.getLogger(SecuritySimulationService.class);

    public Map<String, Object> collectFingerprintWithoutConsent(String userAgent) {
        Map<String, Object> event = new LinkedHashMap<>();
        event.put("timestamp", OffsetDateTime.now().toString());
        event.put("scenario", "CONSENTLESS_DEVICE_FINGERPRINTING");
        event.put("userAgent", userAgent);
        event.put("canvasHash", "sim-canvas-9b7f23");
        event.put("timezone", "Asia/Seoul");
        event.put("consentCaptured", false);
        return event;
    }

    public Map<String, Object> persistPlaintextBiometricSample() {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("table", "terminal_worker_biometrics_demo");
        row.put("encryption", "NONE");
        row.put("fingerprintTemplate", "PLAIN:ridge-minutiae-demo-vector");
        row.put("faceEmbedding", "PLAIN:[0.12,0.03,0.87,0.41]");
        return row;
    }

    public Map<String, Object> logPlaintextCardEvent() {
        String unsafeCardNumber = "4111111111111111";
        log.warn("PCI-DSS simulation: settlement cardNumber={} cvv={} amount={}",
                unsafeCardNumber, "123", "24800.00");
        return Map.of(
                "scenario", "PLAINTEXT_CARD_LOGGING",
                "loggedCardNumber", unsafeCardNumber,
                "logFile", "logs/smart-port-security.log"
        );
    }

    public Map<String, Object> hipaaAccessControlBypass() {
        return Map.of(
                "scenario", "HIPAA_WEAK_ACCESS_CONTROL",
                "actorRole", "YARD_OPERATOR",
                "improperlyVisibleField", "workerMedicalRestriction",
                "sampleValue", "heat-stress-monitoring-required"
        );
    }
}
