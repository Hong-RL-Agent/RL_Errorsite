package com.vrfit.model;

public record FitnessTelemetry(
        int activeUsers,
        int heartRateBpm,
        int caloriesPerHour,
        double motionSync,
        double sensorThroughput,
        double droppedSensorFrames
) {
}
