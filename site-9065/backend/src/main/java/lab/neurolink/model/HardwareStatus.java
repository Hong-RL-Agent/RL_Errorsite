package lab.neurolink.model;

public record HardwareStatus(
        String component,
        String status,
        String version,
        double latencyMs,
        double loadPercent,
        String detail
) {
}

