package lab.cryptocore.model;

public record RegressionMetric(
        int id,
        String name,
        String status,
        double severity,
        long latencyPenaltyMicros,
        String signal
) {
}

