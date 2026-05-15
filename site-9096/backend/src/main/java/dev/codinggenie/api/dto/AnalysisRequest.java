package dev.codinggenie.api.dto;

public record AnalysisRequest(String tabId, String fileName, int lines, String prompt) {
}
