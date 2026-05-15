package com.aieducation.model;

import java.util.List;

public record DashboardSnapshot(
        List<LearningCell> heatmap,
        List<Recommendation> recommendations,
        List<SecurityLog> securityLogs,
        List<String> activeSignals,
        int averageMastery,
        int threatScore
) {
}
