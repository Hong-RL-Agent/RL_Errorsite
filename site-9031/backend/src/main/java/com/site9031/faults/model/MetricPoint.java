package com.site9031.faults.model;

public record MetricPoint(
        String time,
        double cpu,
        double memory,
        double ioWait,
        double fdUsage,
        double inodeUsage,
        double zombieWorkers
) {
}
