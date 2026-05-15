package com.metamart.sim;

public record SimResult(
        String pattern,
        long latencyMs,
        boolean triggered,
        String detail
) {
}
