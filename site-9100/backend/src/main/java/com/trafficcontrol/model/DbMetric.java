package com.trafficcontrol.model;

public record DbMetric(String label, double value, String unit, String status) {
}
