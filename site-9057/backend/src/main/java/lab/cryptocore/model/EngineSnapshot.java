package lab.cryptocore.model;

import java.util.List;

public record EngineSnapshot(
        String symbol,
        double lastPrice,
        double dayChange,
        double equity,
        double marginUsed,
        long matchedOrders,
        long engineLatencyMicros,
        List<OrderBookLevel> bids,
        List<OrderBookLevel> asks,
        List<TradePrint> trades,
        List<MarketTick> candles,
        List<RegressionMetric> regressions
) {
}

