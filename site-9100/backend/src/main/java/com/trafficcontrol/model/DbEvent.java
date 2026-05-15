package com.trafficcontrol.model;

public record DbEvent(String time, String severity, String source, String message) {
}
