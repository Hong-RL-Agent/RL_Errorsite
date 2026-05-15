package bio.genomex.model;

import java.time.Instant;
import java.util.List;

public record SequencingFrame(
        Instant timestamp,
        List<String> reads,
        List<Double> confidence,
        List<Integer> variantPositions
) {
}
