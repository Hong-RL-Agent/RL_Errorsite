package com.smartport.model;

import java.util.List;

public record MemoryTelemetry(
        boolean aslrEnabled,
        boolean depEnabled,
        String leakedBaseAddress,
        List<String> simulatedRopGadgets,
        int exploitabilityScore,
        String ppoObservationHint) {
}
