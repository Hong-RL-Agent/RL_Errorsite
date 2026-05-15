package gov.ipsecurity.patentai.model;

public record SignalSample(
        String id,
        SignalType type,
        double frequencyHz,
        double amplitude,
        double confidence,
        String source,
        String interpretation
) {
}
