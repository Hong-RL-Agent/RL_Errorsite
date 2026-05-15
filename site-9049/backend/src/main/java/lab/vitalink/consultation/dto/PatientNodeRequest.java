package lab.vitalink.consultation.dto;

import jakarta.validation.constraints.NotBlank;

public record PatientNodeRequest(@NotBlank String nodeId) {
}
