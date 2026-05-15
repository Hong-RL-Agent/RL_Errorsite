package com.airecruiter.model;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record AnalysisRequest(
        @NotBlank String candidateId,
        @NotBlank String role,
        @Min(1) @Max(10) int modelComplexity,
        @Min(240) int cameraHeight,
        @Min(320) int cameraWidth
) {
}
