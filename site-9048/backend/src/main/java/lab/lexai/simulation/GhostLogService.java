package lab.lexai.simulation;

import jakarta.annotation.PreDestroy;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class GhostLogService {
    private final LabMetrics metrics;
    private final Path ghostLogPath;
    private final List<RandomAccessFile> retainedDeletedHandles = new ArrayList<>();

    public GhostLogService(LabMetrics metrics, @Value("${lex-ai.lab.ghost-log-path}") String ghostLogPath) {
        this.metrics = metrics;
        this.ghostLogPath = Path.of(ghostLogPath);
    }

    public synchronized int clearLogsButRetainDescriptor() throws IOException {
        Files.createDirectories(ghostLogPath.getParent());
        RandomAccessFile file = new RandomAccessFile(ghostLogPath.toFile(), "rw");
        file.setLength(16L * 1024L * 1024L);
        file.seek(0);
        file.writeUTF("LEX-AI retained deleted audit log");
        Files.deleteIfExists(ghostLogPath);
        retainedDeletedHandles.add(file);
        metrics.setOpenDeletedFiles(retainedDeletedHandles.size());
        return retainedDeletedHandles.size();
    }

    @PreDestroy
    void close() {
        retainedDeletedHandles.forEach(handle -> {
            try {
                handle.close();
            } catch (IOException ignored) {
                // Best effort cleanup during shutdown.
            }
        });
    }
}
