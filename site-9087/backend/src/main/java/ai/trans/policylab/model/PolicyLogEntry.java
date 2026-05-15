package ai.trans.policylab.model;

import java.time.Instant;

public record PolicyLogEntry(Instant timestamp, String channel, String message) {
}

