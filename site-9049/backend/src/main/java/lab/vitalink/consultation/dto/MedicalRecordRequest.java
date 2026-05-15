package lab.vitalink.consultation.dto;

import jakarta.validation.constraints.NotBlank;

public record MedicalRecordRequest(
        @NotBlank String patientId,
        String summary,
        String medicationPlan
) {
    public int payloadSize() {
        int summarySize = summary == null ? 0 : summary.length();
        int planSize = medicationPlan == null ? 0 : medicationPlan.length();
        return patientId.length() + summarySize + planSize;
    }
}
