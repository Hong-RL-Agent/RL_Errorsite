package space.asteroidguard.model;

import java.time.Instant;
import java.util.List;

public final class GuardModels {
    private GuardModels() {
    }

    public record TelemetrySnapshot(
            String station,
            String publicBaseUrl,
            int simulationPort,
            Instant generatedAt,
            ThreatScore threatScore,
            List<AsteroidTrack> asteroidTracks,
            List<ObservationNode> observationNodes,
            List<DirectoryNode> directoryNodes,
            List<SecurityIncident> incidents,
            List<C2LogEntry> c2Logs) {
    }

    public record ThreatScore(int orbitalRisk, int kernelIntegrity, int adExposure, int c2Noise) {
    }

    public record AsteroidTrack(String id, double radiusAu, double velocityKps, double approachAngle, String status) {
    }

    public record ObservationNode(String id, String region, double lat, double lon, int uptime, String state) {
    }

    public record DirectoryNode(String id, String parentId, String label, String tier, int exposure, String status) {
    }

    public record SecurityIncident(
            String id,
            String title,
            String category,
            String severity,
            String trainingPattern,
            String signal,
            String defensiveAction) {
    }

    public record C2LogEntry(String timestamp, String source, String destination, String protocol, String verdict) {
    }
}

