package com.healthpill.model;

import java.time.Instant;

public record HeartbeatSample(Instant at, int bpm, int spo2, int variability, String status) {
}
