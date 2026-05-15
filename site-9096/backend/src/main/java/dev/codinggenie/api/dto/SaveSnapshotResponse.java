package dev.codinggenie.api.dto;

public record SaveSnapshotResponse(String snapshotId, String tabId, int lines, String status, String savedAt) {
}
