package lab.vitalink.consultation;

import jakarta.validation.Valid;
import lab.vitalink.anomaly.SystemAnomalyService;
import lab.vitalink.consultation.dto.MedicalRecordRequest;
import lab.vitalink.consultation.dto.PatientNodeRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/consultation")
@CrossOrigin
public class ConsultationController {
    private final SystemAnomalyService anomalyService;

    public ConsultationController(SystemAnomalyService anomalyService) {
        this.anomalyService = anomalyService;
    }

    @GetMapping("/pulse")
    public Map<String, Object> pulse() {
        return anomalyService.processConsultation();
    }

    @PostMapping("/records")
    public ResponseEntity<Map<String, Object>> saveRecord(@Valid @RequestBody MedicalRecordRequest request) {
        return ResponseEntity.ok(anomalyService.saveMedicalRecord(request.patientId(), request.payloadSize()));
    }

    @PostMapping("/remote-node")
    public Map<String, Object> remoteNode(@Valid @RequestBody PatientNodeRequest request) {
        return anomalyService.accessRemotePatientNode(request.nodeId());
    }

    @PostMapping("/diagnostic-image-stream")
    public Map<String, Object> diagnosticImageStream() {
        return anomalyService.streamDiagnosticImage();
    }

    @PostMapping("/genomic-analysis")
    public Map<String, Object> genomicAnalysis() {
        return anomalyService.runGenomicAnalysis();
    }

    @PostMapping("/spinlock")
    public Map<String, Object> spinlock() {
        return anomalyService.contendSpinlock();
    }

    @PostMapping("/cow-fault-storm")
    public Map<String, Object> cowFaultStorm() {
        return anomalyService.triggerCowFaultStorm();
    }

    @PostMapping("/serialize")
    public Map<String, Object> serialize() {
        return anomalyService.serializeClinicalPayload();
    }
}
