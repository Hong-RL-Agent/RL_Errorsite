package com.vrfit.model;

public record MotionJoint(
        String joint,
        double x,
        double y,
        double z,
        double confidence
) {
}
