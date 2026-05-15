package ai.trans.policylab.service;

import ai.trans.policylab.model.PolicyLogEntry;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

@Service
public class PolicyLogService {
    private final Deque<PolicyLogEntry> entries = new ArrayDeque<>();
    private final Path policyLogPath;

    public PolicyLogService(@Value("${ai-trans.policy-log}") String policyLogPath) {
        this.policyLogPath = Path.of(policyLogPath);
        record("system", "AI-TRANS policy logger initialized for http://localhost:9087");
    }

    public synchronized PolicyLogEntry record(String channel, String message) {
        PolicyLogEntry entry = new PolicyLogEntry(Instant.now(), channel, message);
        entries.addFirst(entry);
        while (entries.size() > 160) {
            entries.removeLast();
        }
        appendToFile(entry);
        return entry;
    }

    public synchronized List<PolicyLogEntry> latest() {
        return new ArrayList<>(entries);
    }

    private void appendToFile(PolicyLogEntry entry) {
        try {
            Path parent = policyLogPath.getParent();
            if (parent != null) {
                Files.createDirectories(parent);
            }
            String line = "%s [%s] %s%n".formatted(entry.timestamp(), entry.channel(), entry.message());
            Files.writeString(policyLogPath, line, StandardOpenOption.CREATE, StandardOpenOption.APPEND);
        } catch (IOException ignored) {
            // The in-memory terminal remains authoritative if the mounted log path is unavailable.
        }
    }
}

