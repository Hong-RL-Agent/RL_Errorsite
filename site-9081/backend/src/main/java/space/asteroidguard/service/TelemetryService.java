package space.asteroidguard.service;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import space.asteroidguard.model.GuardModels.AsteroidTrack;
import space.asteroidguard.model.GuardModels.C2LogEntry;
import space.asteroidguard.model.GuardModels.DirectoryNode;
import space.asteroidguard.model.GuardModels.ObservationNode;
import space.asteroidguard.model.GuardModels.SecurityIncident;
import space.asteroidguard.model.GuardModels.TelemetrySnapshot;
import space.asteroidguard.model.GuardModels.ThreatScore;

@Service
public class TelemetryService {
    private static final DateTimeFormatter LOG_TIME =
            DateTimeFormatter.ofPattern("HH:mm:ss'Z'").withZone(ZoneOffset.UTC);

    private final String publicBaseUrl;
    private final int simulationPort;

    public TelemetryService(
            @Value("${asteroid-guard.public-base-url}") String publicBaseUrl,
            @Value("${asteroid-guard.simulation-port}") int simulationPort) {
        this.publicBaseUrl = publicBaseUrl;
        this.simulationPort = simulationPort;
    }

    public TelemetrySnapshot snapshot() {
        Instant now = Instant.now();
        return new TelemetrySnapshot(
                "ASTEROID-GUARD / EARTH DEFENSE ROOM",
                publicBaseUrl,
                simulationPort,
                now,
                new ThreatScore(82, 41, 89, 76),
                asteroidTracks(),
                observationNodes(),
                directoryNodes(),
                incidents(),
                c2Logs(now));
    }

    private List<AsteroidTrack> asteroidTracks() {
        return List.of(
                new AsteroidTrack("AG-2049-VULCAN", 0.74, 28.4, 18.0, "INTERCEPT WINDOW"),
                new AsteroidTrack("AG-1138-CERES", 1.18, 16.7, 132.0, "TRACKING"),
                new AsteroidTrack("AG-9081-ONYX", 0.42, 41.2, 284.0, "CRITICAL APPROACH"),
                new AsteroidTrack("AG-77-ORION", 1.62, 11.9, 225.0, "STABLE"));
    }

    private List<ObservationNode> observationNodes() {
        return List.of(
                new ObservationNode("DSS-KR-01", "Korea Deep Space Array", 37.2, 127.0, 99, "CYAN"),
                new ObservationNode("LUNA-GW-04", "Lunar Relay Gateway", 12.0, 42.0, 92, "GOLD"),
                new ObservationNode("ATLAS-US-22", "North America Radar Grid", 39.0, -104.0, 96, "CYAN"),
                new ObservationNode("SENTINEL-EU-7", "European Optical Net", 48.8, 2.3, 87, "GOLD"),
                new ObservationNode("PAC-RIM-19", "Pacific Infrared Fence", -21.0, 151.0, 71, "RED"),
                new ObservationNode("POLAR-SIG-3", "Arctic Signal Station", 69.0, -51.0, 84, "GOLD"));
    }

    private List<DirectoryNode> directoryNodes() {
        return List.of(
                new DirectoryNode("root", null, "EARTHDEFENSE.LOCAL", "Forest Root", 94, "BREACH RISK"),
                new DirectoryNode("dc", "root", "Domain Controllers", "Tier 0", 91, "PRIVILEGE COLLAPSE"),
                new DirectoryNode("admins", "root", "Mission Admins", "Tier 0", 88, "TOKEN DRIFT"),
                new DirectoryNode("svc", "root", "Service Accounts", "Tier 1", 83, "KERBEROASTABLE"),
                new DirectoryNode("ops", "admins", "Orbital Operations", "Tier 1", 58, "WATCH"),
                new DirectoryNode("workstations", "ops", "Control Room Workstations", "Tier 2", 72, "USB INCIDENT"),
                new DirectoryNode("profiles", "workstations", "Roaming Profiles", "Tier 2", 79, "PROFILE TAINT"));
    }

    private List<SecurityIncident> incidents() {
        return List.of(
                incident("INC-ROOTKIT", "Kernel process cloaking anomaly", "Kernel", "CRITICAL", "Rootkit", "Hidden module count diverged from signed inventory", "Isolate host and trigger memory acquisition"),
                incident("INC-FIRMWARE", "Firmware integrity drift on lunar relay", "Hardware", "HIGH", "Firmware Exposure", "Measured boot hash changed outside maintenance window", "Lock firmware channel and compare golden image"),
                incident("INC-AIRGAP", "Air-gap relay queue overflow", "Exfiltration", "HIGH", "Air-gap Bypass", "One-way telemetry queue moved restricted mission data", "Disable relay bridge and rotate staging credentials"),
                incident("INC-USB", "Administrator console autorun event", "Endpoint", "HIGH", "USB Autorun Malware", "Removable media spawned elevated child process", "Quarantine console and revoke local admin token"),
                incident("INC-ZERO", "Unclassified exploit pattern against trajectory API", "Application", "CRITICAL", "Zero-day", "Crash loop with no matching signature", "Apply virtual patch and capture request corpus"),
                incident("INC-APT", "Low-rate internal exfiltration sequence", "Insider", "HIGH", "APT Exfiltration", "Compressed archive fragments leaving research enclave", "Throttle egress and start user behavior review"),
                incident("INC-C2", "Command channel beacon cadence detected", "Network", "CRITICAL", "C2 Channel", "Beacon interval remained stable across jitter windows", "Sinkhole destination and preserve flow records"),
                incident("INC-ROAM", "Roaming profile script taint", "Identity", "HIGH", "Roaming Profile Pollution", "Profile logon script modified across control-room hosts", "Restore profile baseline and force clean logon"),
                incident("INC-AD", "Tier-0 privilege hierarchy collapse", "Identity", "CRITICAL", "AD Takeover", "Unexpected Domain Admin membership and GPO propagation", "Freeze GPO changes and initiate forest recovery playbook"),
                incident("INC-KRB", "Service ticket request spike", "Identity", "HIGH", "Kerberoasting", "SPN-bound accounts received abnormal TGS volume", "Rotate service secrets and enforce AES-only policy"),
                incident("INC-PTH", "Hash-only lateral authentication", "Identity", "CRITICAL", "Pass-the-Hash", "NTLM success from hosts without interactive logon trail", "Disable NTLM path and reset exposed credentials"));
    }

    private SecurityIncident incident(
            String id,
            String title,
            String category,
            String severity,
            String trainingPattern,
            String signal,
            String defensiveAction) {
        return new SecurityIncident(id, title, category, severity, trainingPattern, signal, defensiveAction);
    }

    private List<C2LogEntry> c2Logs(Instant now) {
        return List.of(
                log(now.minusSeconds(4), "DSS-KR-01", "blackhole-sinkhole.local", "HTTPS/443", "BLOCKED C2 BEACON"),
                log(now.minusSeconds(9), "ADMIN-ORBIT-7", "staging-relay.invalid", "DNS/TXT", "SIMULATED EXFIL"),
                log(now.minusSeconds(15), "DC-PRIMARY", "identity-audit.local", "KERBEROS", "TGS SPIKE"),
                log(now.minusSeconds(22), "PAC-RIM-19", "lunar-gw-04", "MQTT/TLS", "FIRMWARE DRIFT"),
                log(now.minusSeconds(31), "OPS-ROAM-14", "profile-share", "SMB", "PROFILE TAINT"),
                log(now.minusSeconds(45), "AG-9081-ONYX", "intercept-grid", "S-BAND", "ORBIT UPDATE"));
    }

    private C2LogEntry log(Instant time, String source, String destination, String protocol, String verdict) {
        return new C2LogEntry(LOG_TIME.format(time), source, destination, protocol, verdict);
    }
}

