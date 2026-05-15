package com.smartescrow.model;

public record UploadResult(
        String fileName,
        String detectedMime,
        long bytes,
        String verdict,
        String simulationNote
) {
}
