package com.holocomm.model;

import java.time.Instant;
import java.util.List;

public final class HoloModels {
  private HoloModels() {}

  public record SystemStatus(
      String baseUrl,
      String engineVersion,
      String renderMode,
      String securityPolicy,
      Instant serverTime
  ) {}

  public record ParticipantMetric(
      String id,
      String name,
      int audioLatencyMs,
      int videoLatencyMs,
      int packetLossPermille,
      String streamState
  ) {}

  public record VramGauge(
      int totalGb,
      double usedGb,
      double fragmentedGb,
      double zombieGb,
      int utilizationPercent
  ) {}

  public record TelemetryFrame(
      long tick,
      List<ParticipantMetric> participants,
      VramGauge vram,
      int pointCloudDensity,
      int npuCompilerDriftPercent,
      int blockedPatchJobs
  ) {}

  public record FaultScenario(
      int id,
      String title,
      String subsystem,
      String trigger,
      String ppoSignal,
      String expectedMitigation,
      String severity,
      boolean active
  ) {}

  public record TerminalLog(
      Instant at,
      String level,
      String source,
      String message
  ) {}
}
