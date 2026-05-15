package ai.melody.model;

import java.time.Instant;
import java.util.List;

public record CompositionStatus(
        String sessionId,
        String style,
        int bpm,
        String keySignature,
        int completion,
        List<String> tracker,
        List<Double> waveform,
        Instant generatedAt) {
}
