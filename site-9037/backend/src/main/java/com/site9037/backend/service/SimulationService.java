package com.site9037.backend.service;

import org.springframework.stereotype.Service;

import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.IntStream;

@Service
public class SimulationService {

    private static final int MEMORY_CHUNK_MB = 6;
    private static final int FILE_DESCRIPTOR_LIMIT = 32;

    private final List<byte[]> memoryLeakBuffer = new ArrayList<>();
    private final List<BufferedWriter> leakedWriters = new ArrayList<>();
    private final LinkedList<String> inFlightEvents = new LinkedList<>();

    private long totalLostRecords;
    private long ungracefulShutdownCount;

    public synchronized Map<String, Object> overview() {
        long retainedMemoryMb = (long) memoryLeakBuffer.size() * MEMORY_CHUNK_MB;
        int openDescriptors = leakedWriters.size();
        long baseCpu = 41 + (retainedMemoryMb / 8) + (openDescriptors / 2);
        long cpuLoad = Math.min(baseCpu + ThreadLocalRandom.current().nextLong(0, 9), 99);
        long gpuLoad = Math.min(52 + (retainedMemoryMb / 12) + ThreadLocalRandom.current().nextLong(0, 13), 99);
        long queueDepth = 160 + inFlightEvents.size() * 2L + openDescriptors;

        return Map.of(
                "timestamp", Instant.now().toString(),
                "cluster", Map.of(
                        "name", "Aegis Compute Cluster / Zone-9037",
                        "cpuLoad", cpuLoad,
                        "gpuLoad", gpuLoad,
                        "queueDepth", queueDepth
                ),
                "faults", Map.of(
                        "140", Map.of(
                                "title", "Memory Leak",
                                "retainedMemoryMb", retainedMemoryMb,
                                "status", retainedMemoryMb > 0 ? "degrading" : "stable"
                        ),
                        "145", Map.of(
                                "title", "File Descriptor Leak",
                                "openFileDescriptors", openDescriptors,
                                "threshold", FILE_DESCRIPTOR_LIMIT,
                                "status", openDescriptors > 0 ? "warning" : "stable"
                        ),
                        "150", Map.of(
                                "title", "Ungraceful Shutdown",
                                "lostRecords", totalLostRecords,
                                "shutdownIncidents", ungracefulShutdownCount,
                                "status", totalLostRecords > 0 ? "critical" : "stable"
                        )
                )
        );
    }

    public synchronized Map<String, Object> triggerFault(int index) {
        return switch (index) {
            case 140 -> triggerMemoryLeak();
            case 145 -> triggerFileDescriptorLeak();
            case 150 -> triggerUngracefulShutdown();
            default -> throw new IllegalArgumentException("Unsupported fault index: " + index);
        };
    }

    public synchronized Map<String, Object> resetFault(int index) {
        return switch (index) {
            case 140 -> resetMemoryLeak();
            case 145 -> resetFileDescriptorLeak();
            case 150 -> resetUngracefulShutdown();
            default -> throw new IllegalArgumentException("Unsupported fault index: " + index);
        };
    }

    private Map<String, Object> triggerMemoryLeak() {
        memoryLeakBuffer.add(new byte[MEMORY_CHUNK_MB * 1024 * 1024]);
        long retainedMemoryMb = (long) memoryLeakBuffer.size() * MEMORY_CHUNK_MB;
        return Map.of(
                "index", 140,
                "message", "Memory allocated without release. System usage keeps climbing.",
                "retainedMemoryMb", retainedMemoryMb
        );
    }

    private Map<String, Object> triggerFileDescriptorLeak() {
        if (leakedWriters.size() >= FILE_DESCRIPTOR_LIMIT) {
            throw new IllegalStateException("File creation failed: simulated descriptor table exhausted.");
        }

        try {
            Path dir = Path.of("sim-logs");
            Files.createDirectories(dir);
            Path file = dir.resolve(String.format(Locale.ROOT, "fd-leak-%d.log", System.nanoTime()));
            BufferedWriter writer = Files.newBufferedWriter(file, StandardOpenOption.CREATE_NEW, StandardOpenOption.WRITE);
            writer.write(Instant.now() + " :: Opened for streaming telemetry but never closed.\n");
            writer.flush();
            leakedWriters.add(writer);
        } catch (IOException e) {
            throw new IllegalStateException("File creation failed during descriptor leak simulation.", e);
        }

        return Map.of(
                "index", 145,
                "message", "Log file opened and left unclosed. Future file creation may fail.",
                "openFileDescriptors", leakedWriters.size(),
                "threshold", FILE_DESCRIPTOR_LIMIT
        );
    }

    private Map<String, Object> triggerUngracefulShutdown() {
        IntStream.range(0, 8).forEach(i -> inFlightEvents.add("payload-" + System.nanoTime() + "-" + i));
        long lostNow = inFlightEvents.size();
        inFlightEvents.clear();
        totalLostRecords += lostNow;
        ungracefulShutdownCount++;

        return Map.of(
                "index", 150,
                "message", "Termination handler missed. Buffered records were dropped.",
                "lostRecordsThisIncident", lostNow,
                "totalLostRecords", totalLostRecords
        );
    }

    private Map<String, Object> resetMemoryLeak() {
        memoryLeakBuffer.clear();
        return Map.of(
                "index", 140,
                "message", "Memory leak simulation reset.",
                "retainedMemoryMb", 0
        );
    }

    private Map<String, Object> resetFileDescriptorLeak() {
        for (BufferedWriter writer : leakedWriters) {
            try {
                writer.close();
            } catch (IOException e) {
                throw new IllegalStateException("Failed to close leaked descriptor during reset.", e);
            }
        }
        leakedWriters.clear();
        return Map.of(
                "index", 145,
                "message", "Descriptor leak simulation reset.",
                "openFileDescriptors", 0
        );
    }

    private Map<String, Object> resetUngracefulShutdown() {
        inFlightEvents.clear();
        totalLostRecords = 0;
        ungracefulShutdownCount = 0;
        return Map.of(
                "index", 150,
                "message", "Ungraceful shutdown simulation reset.",
                "totalLostRecords", 0
        );
    }
}

