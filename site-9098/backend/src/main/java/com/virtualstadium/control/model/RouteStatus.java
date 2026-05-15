package com.virtualstadium.control.model;

public record RouteStatus(String path, String state, int latencyMs, double utilization, String defect) {
}
