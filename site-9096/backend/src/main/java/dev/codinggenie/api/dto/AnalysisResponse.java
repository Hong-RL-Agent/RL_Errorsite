package dev.codinggenie.api.dto;

import java.util.List;

public record AnalysisResponse(
    String traceId,
    String tabId,
    String fileName,
    int severity,
    List<String> findings,
    String engine,
    String completedAt
) {
}
