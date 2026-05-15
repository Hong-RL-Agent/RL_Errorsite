package com.virtualestate.model;

public record SecurityEvent(
        String id,
        String timestamp,
        String category,
        String title,
        String signal,
        String severity,
        String location,
        int confidence,
        String recommendedAction
) {
}
