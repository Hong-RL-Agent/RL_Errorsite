package dev.codinggenie.api.dto;

public record MetricsResponse(int fps, int memoryMb, int longTasks, int domNodes, String sampledAt) {
}
