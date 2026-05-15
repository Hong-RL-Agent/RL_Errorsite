package dev.codinggenie.api.dto;

public record SaveSnapshotRequest(String tabId, String fileName, int lines, String contentHash) {
}
