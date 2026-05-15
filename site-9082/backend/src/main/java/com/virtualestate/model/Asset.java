package com.virtualestate.model;

public record Asset(
        String id,
        String name,
        String district,
        String tier,
        long valuationUsd,
        int trustScore,
        String status
) {
}
