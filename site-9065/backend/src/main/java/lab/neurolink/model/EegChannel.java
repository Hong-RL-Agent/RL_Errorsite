package lab.neurolink.model;

import java.util.List;

public record EegChannel(
        String id,
        String label,
        String band,
        double impedanceKohm,
        double microvolts,
        List<Double> waveform
) {
}

