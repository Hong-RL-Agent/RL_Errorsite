package com.smartport.model;

import java.util.List;

public record DashboardSnapshot(
        String controlBaseUrl,
        List<ContainerSlot> containerMap,
        List<VesselSchedule> vesselSchedules,
        MemoryTelemetry memoryTelemetry,
        List<ComplianceItem> complianceChecklist,
        int activeAlerts,
        int automatedCranes,
        double yardUtilization) {
}
