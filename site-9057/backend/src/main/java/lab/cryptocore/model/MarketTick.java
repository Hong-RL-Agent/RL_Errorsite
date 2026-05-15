package lab.cryptocore.model;

public record MarketTick(
        long ts,
        double open,
        double high,
        double low,
        double close,
        double volume
) {
}

