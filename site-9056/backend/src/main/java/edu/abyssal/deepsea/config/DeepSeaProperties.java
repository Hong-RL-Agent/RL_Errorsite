package edu.abyssal.deepsea.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "deepsea")
public record DeepSeaProperties(
        double faultIntensity,
        int diskQueueDepth,
        int cfsQuotaMs
) {
    public double normalizedIntensity() {
        return Math.max(0.0, Math.min(1.0, faultIntensity));
    }

    public int safeDiskQueueDepth() {
        return Math.max(4, diskQueueDepth);
    }

    public int safeCfsQuotaMs() {
        return Math.max(10, cfsQuotaMs);
    }
}
