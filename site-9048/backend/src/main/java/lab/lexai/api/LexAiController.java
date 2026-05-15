package lab.lexai.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeoutException;
import lab.lexai.simulation.DocumentIndexingService;
import lab.lexai.simulation.FragmentedCacheService;
import lab.lexai.simulation.GhostLogService;
import lab.lexai.simulation.GpuInferenceService;
import lab.lexai.simulation.InterruptCoalescenceService;
import lab.lexai.simulation.LabMetrics;
import lab.lexai.simulation.TrimFreezeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class LexAiController {
    private final GpuInferenceService inferenceService;
    private final TrimFreezeRepository trimFreezeRepository;
    private final DocumentIndexingService documentIndexingService;
    private final GhostLogService ghostLogService;
    private final FragmentedCacheService fragmentedCacheService;
    private final InterruptCoalescenceService coalescenceService;
    private final LabMetrics metrics;

    public LexAiController(
            GpuInferenceService inferenceService,
            TrimFreezeRepository trimFreezeRepository,
            DocumentIndexingService documentIndexingService,
            GhostLogService ghostLogService,
            FragmentedCacheService fragmentedCacheService,
            InterruptCoalescenceService coalescenceService,
            LabMetrics metrics) {
        this.inferenceService = inferenceService;
        this.trimFreezeRepository = trimFreezeRepository;
        this.documentIndexingService = documentIndexingService;
        this.ghostLogService = ghostLogService;
        this.fragmentedCacheService = fragmentedCacheService;
        this.coalescenceService = coalescenceService;
        this.metrics = metrics;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        return metrics.snapshot();
    }

    @PostMapping("/inference")
    public Map<String, Object> inference(@Valid @RequestBody InferenceRequest request)
            throws InterruptedException, TimeoutException {
        var result = inferenceService.infer(request.model(), request.prompt());
        return Map.of("ok", true, "result", result, "metrics", metrics.snapshot());
    }

    @PostMapping("/cases")
    public Map<String, Object> writeCase(@Valid @RequestBody CaseWriteRequest request) throws InterruptedException {
        return Map.of("ok", true, "write", trimFreezeRepository.writeCase(request.title(), request.payload()),
                "metrics", metrics.snapshot());
    }

    @PostMapping("/documents/index")
    public Map<String, Object> index(@Valid @RequestBody DocumentRequest request) throws InterruptedException {
        return Map.of("ok", true, "index", documentIndexingService.index(request.document()),
                "metrics", metrics.snapshot());
    }

    @PostMapping("/logs/clear")
    public Map<String, Object> clearLogs() throws IOException {
        return Map.of("ok", true, "openDeletedHandles", ghostLogService.clearLogsButRetainDescriptor(),
                "metrics", metrics.snapshot());
    }

    @PostMapping("/cache/fragment")
    public Map<String, Object> fragment(@Valid @RequestBody CacheRequest request) {
        return Map.of("ok", true, "cache", fragmentedCacheService.putFragmented(request.key(), request.value()),
                "metrics", metrics.snapshot());
    }

    @PostMapping("/network/coalesce")
    public Map<String, Object> coalesce() throws ExecutionException, InterruptedException {
        return Map.of("ok", true, "batch", coalescenceService.waitForBatch().get(),
                "metrics", metrics.snapshot());
    }

    @ExceptionHandler(TimeoutException.class)
    public ResponseEntity<Map<String, Object>> timeout(TimeoutException exception) {
        return ResponseEntity.status(HttpStatus.GATEWAY_TIMEOUT)
                .body(Map.of("ok", false, "error", exception.getMessage(), "metrics", metrics.snapshot()));
    }

    public record InferenceRequest(@NotBlank String model, @NotBlank String prompt) {
    }

    public record CaseWriteRequest(@NotBlank String title, @NotBlank String payload) {
    }

    public record DocumentRequest(@NotBlank String document) {
    }

    public record CacheRequest(@NotBlank String key, @NotBlank String value) {
    }
}
