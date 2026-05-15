package com.healthpill.model;

public record DeploymentStatus(
        String strategy,
        String activeVersion,
        String candidateVersion,
        double errorRate,
        String risk,
        String detail
) {
}
