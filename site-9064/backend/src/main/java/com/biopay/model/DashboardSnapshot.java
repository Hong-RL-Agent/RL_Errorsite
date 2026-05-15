package com.biopay.model;

import java.time.Instant;
import java.util.List;

public record DashboardSnapshot(
        Instant generatedAt,
        double biometricSuccessRate,
        double paymentApprovalRate,
        int activeDevices,
        int quarantinedNodes,
        List<Integer> transactionSeries,
        List<InventoryItem> inventory,
        List<InstallStage> installStages,
        List<DefectScenario> defects
) {
}
