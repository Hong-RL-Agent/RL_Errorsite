package com.airecruiter.service;

import com.airecruiter.config.AiRecruiterProperties;
import com.airecruiter.model.AnalysisRequest;
import com.airecruiter.model.AnalysisResult;
import com.airecruiter.model.InterviewSummary;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.locks.ReentrantLock;
import org.springframework.stereotype.Service;

@Service
public class InterviewAnalysisService {

    private final AiRecruiterProperties properties;
    private final ReentrantLock gpu0 = new ReentrantLock();
    private final ReentrantLock gpu1 = new ReentrantLock();

    public InterviewAnalysisService(AiRecruiterProperties properties) {
        this.properties = properties;
    }

    public List<InterviewSummary> getInterviews() {
        return List.of(
                new InterviewSummary("iv-1048", "김하린", "ML Platform Engineer", "Live technical", 91, "10:30"),
                new InterviewSummary("iv-1049", "이준서", "Product Designer", "Culture fit", 84, "11:20"),
                new InterviewSummary("iv-1050", "박서윤", "Backend Engineer", "AI coding", 78, "13:00"),
                new InterviewSummary("iv-1051", "최민재", "Data Scientist", "Executive review", 88, "15:40")
        );
    }

    public AnalysisResult createLiveSnapshot() {
        return analyze(new AnalysisRequest("live-candidate", "ML Platform Engineer", 7, 1080, 1920));
    }

    public AnalysisResult analyze(AnalysisRequest request) {
        Map<String, Object> trace = new LinkedHashMap<>();

        boolean deadlock = simulateGpuP2pDeadlock(request, trace);
        MemoryFault memoryFault = simulateFragmentedMemory(request, trace);
        CpuFault cpuFault = simulateSpeculativePatchIpcDrop(trace);
        double bandwidth = simulateTrrBandwidthTax(trace);
        int occupancy = simulateRegisterPressure(request, trace);
        LatencyFault latency = simulateTailLatency(trace);

        int fitScore = clamp(92 - request.modelComplexity() * 3 - (deadlock ? 18 : 0) - (memoryFault.allocationFailure() ? 9 : 0), 34, 97);
        int confidence = clamp(90 - (int) Math.round(cpuFault.penaltyMs() / 8.0) - (latency.spike() ? 12 : 0), 30, 96);
        String status = deadlock ? "STALLED" : memoryFault.allocationFailure() ? "DEGRADED" : "COMPLETE";

        return new AnalysisResult(
                "ana-" + UUID.randomUUID().toString().substring(0, 8),
                request.candidateId(),
                status,
                fitScore,
                confidence,
                latency.latencyMs(),
                latency.spike(),
                deadlock,
                memoryFault.allocationFailure(),
                memoryFault.fragmentedMemoryMb(),
                cpuFault.ipcScore(),
                cpuFault.penaltyMs(),
                bandwidth,
                occupancy,
                trace,
                Instant.now()
        );
    }

    private boolean simulateGpuP2pDeadlock(AnalysisRequest request, Map<String, Object> trace) {
        boolean eligible = properties.getGpuCount() >= 2 && Math.abs(request.candidateId().hashCode()) % 7 == 0;
        if (!eligible) {
            trace.put("gpuP2P", "healthy");
            return false;
        }

        boolean leftLocked = gpu0.tryLock();
        boolean rightLocked = gpu1.tryLock();
        if (leftLocked && rightLocked) {
            gpu1.unlock();
            gpu0.unlock();
        }
        trace.put("gpuP2P", "simulated circular wait between gpu0 and gpu1");
        return true;
    }

    private MemoryFault simulateFragmentedMemory(AnalysisRequest request, Map<String, Object> trace) {
        int requestedMb = 384 + request.modelComplexity() * 96;
        int ghostReservationMb = requestedMb + 256;
        int fragmentedMb = 512 + request.modelComplexity() * 137;
        boolean allocationFailure = fragmentedMb > 1300 && ghostReservationMb > 1024;
        trace.put("memory", Map.of(
                "requestedMb", requestedMb,
                "ghostReservationMb", ghostReservationMb,
                "largestContiguousBlockMb", Math.max(64, 1536 - fragmentedMb)
        ));
        return new MemoryFault(fragmentedMb, allocationFailure);
    }

    private CpuFault simulateSpeculativePatchIpcDrop(Map<String, Object> trace) {
        if (!properties.isCpuPatched()) {
            trace.put("cpu", "unpatched baseline");
            return new CpuFault(1.0, 0);
        }

        long penalty = 48 + ThreadLocalRandom.current().nextLong(36);
        double ipcScore = 0.62 + ThreadLocalRandom.current().nextDouble(0.08);
        trace.put("cpu", Map.of("speculativeExecutionPatch", true, "ipcDropPercent", Math.round((1 - ipcScore) * 100)));
        return new CpuFault(ipcScore, penalty);
    }

    private double simulateTrrBandwidthTax(Map<String, Object> trace) {
        double baseline = 51.2;
        if (!properties.isTrrEnabled()) {
            trace.put("memoryTrr", "disabled");
            return baseline;
        }

        double taxed = baseline * 0.57;
        trace.put("memoryTrr", Map.of("rowhammerDefense", "TRR", "bandwidthTaxPercent", 43));
        return Math.round(taxed * 10.0) / 10.0;
    }

    private int simulateRegisterPressure(AnalysisRequest request, Map<String, Object> trace) {
        int registersPerThread = 32 + request.modelComplexity() * 14;
        int occupancy = clamp(96 - Math.max(0, registersPerThread - 64), 18, 96);
        trace.put("gpuRegisterFile", Map.of("registersPerThread", registersPerThread, "occupancyPercent", occupancy));
        return occupancy;
    }

    private LatencyFault simulateTailLatency(Map<String, Object> trace) {
        Random random = ThreadLocalRandom.current();
        boolean spike = random.nextInt(100) == 0;
        long latency = spike ? 3000 + random.nextLong(850) : 62 + random.nextLong(90);
        trace.put("network", spike ? "p99 tail latency spike" : "nominal");
        return new LatencyFault(latency, spike);
    }

    private int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }

    private record MemoryFault(int fragmentedMemoryMb, boolean allocationFailure) {
    }

    private record CpuFault(double ipcScore, long penaltyMs) {
    }

    private record LatencyFault(long latencyMs, boolean spike) {
    }
}
