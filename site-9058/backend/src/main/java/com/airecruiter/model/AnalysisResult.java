package com.airecruiter.model;

import java.time.Instant;
import java.util.Map;

public record AnalysisResult(
        String analysisId,
        String candidateId,
        String status,
        int fitScore,
        int confidenceScore,
        long networkLatencyMs,
        boolean tailLatencySpike,
        boolean gpuP2pDeadlock,
        boolean allocationFailure,
        int fragmentedMemoryMb,
        double ipcScore,
        long cpuPatchPenaltyMs,
        double memoryBandwidthGbps,
        int gpuOccupancyPercent,
        Map<String, Object> faultTrace,
        Instant createdAt
) {
}
