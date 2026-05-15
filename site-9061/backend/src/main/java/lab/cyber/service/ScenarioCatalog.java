package lab.cyber.service;

import java.util.List;

public final class ScenarioCatalog {
    public static final List<Entry> ENTRIES = List.of(
            new Entry("cpu-quota", "Container Quota Throttling", "CPU quota saturation"),
            new Entry("memory-jitter", "VM Memory Jitter", "available memory oscillation"),
            new Entry("ghost-file", "Ghost File Handle", "deleted log still holds disk pressure"),
            new Entry("steal-time", "Steal Time", "background workers delay main flow"),
            new Entry("c-state-delay", "C-State Wake Delay", "10-20 ms response pre-delay"),
            new Entry("dirty-page-writeback", "Dirty Page Writeback", "chunked writes stall response"),
            new Entry("bad-process-manager", "Bad Process Manager", "core sampler exits before auxiliaries"),
            new Entry("hard-lockup", "System Hard Lockup", "event loop monopolized for 1.5 s"),
            new Entry("journal-wait", "Journaling Wait", "synthetic fsync integrity wait"),
            new Entry("fragmentation-stall", "Fragmentation Cleanup Stall", "large object cleanup CPU spike"),
            new Entry("silent-circuit-breaker", "Silent Circuit Breaker", "HTTP 200 empty JSON masks failure")
    );

    private ScenarioCatalog() {
    }

    public record Entry(String id, String name, String signal) {
    }
}
