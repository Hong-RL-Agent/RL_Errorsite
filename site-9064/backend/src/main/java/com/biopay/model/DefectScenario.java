package com.biopay.model;

public record DefectScenario(
        int id,
        String title,
        String phase,
        String severity,
        String signal,
        String antiPattern,
        int progress,
        boolean active
) {
}
