package com.airecruiter.model;

public record InterviewSummary(
        String id,
        String candidate,
        String role,
        String stage,
        int fitScore,
        String scheduledAt
) {
}
