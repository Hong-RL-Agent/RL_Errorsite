package gov.ipsecurity.patentai.service;

import gov.ipsecurity.patentai.model.AlertSeverity;
import gov.ipsecurity.patentai.model.DashboardResponse;
import gov.ipsecurity.patentai.model.IntegrityStatus;
import gov.ipsecurity.patentai.model.PatentDocument;
import gov.ipsecurity.patentai.model.SecurityEvent;
import gov.ipsecurity.patentai.model.SignalSample;
import gov.ipsecurity.patentai.model.SignalType;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SimulationService {
    public DashboardResponse dashboard() {
        return new DashboardResponse(
                "PATENT-AI / Compartment 9083",
                "http://localhost:9083",
                document(),
                signals(),
                integrity(),
                events()
        );
    }

    public PatentDocument document() {
        return new PatentDocument(
                "KR-SEC-9083-DELTA",
                "TOP SECRET / IP-COMPARTMENT",
                "Adaptive Patent Corpus Isolation for Physical Side-Channel Resistant Analysis",
                "A classified analytical method for rendering sensitive patent claims while monitoring physical-layer leakage indicators and forensic trace continuity.",
                List.of(
                        "Claim 1: A rendering enclave correlates patent viewport state with electromagnetic variance telemetry.",
                        "Claim 2: A forensic ledger records immutable event order for document access and export attempts.",
                        "Claim 3: A policy engine blocks non-watermarked patent artifacts from leaving the analysis boundary."
                ),
                List.of("screen-render-vector", "unwatermarked-export", "sensor-fusion-risk", "9083-isolated")
        );
    }

    public List<SignalSample> signals() {
        return List.of(
                new SignalSample("SIG-TEMPEST-001", SignalType.ELECTROMAGNETIC, 312000000.0, 0.82, 0.91, "viewer-rack-a", "TEMPEST-like screen refresh leakage pattern"),
                new SignalSample("SIG-ULTRA-002", SignalType.ULTRASONIC, 19850.0, 0.64, 0.78, "mobile-adjacent-node", "unauthorized ultrasonic device tracking beacon"),
                new SignalSample("SIG-PWR-003", SignalType.POWER, 60.0, 0.76, 0.84, "crypto-worker-7", "power analysis trace correlated with key schedule activity"),
                new SignalSample("SIG-ACOUSTIC-004", SignalType.ACOUSTIC, 11800.0, 0.58, 0.72, "cpu-array-c", "CPU acoustic waveform anomaly during patent ranking"),
                new SignalSample("SIG-GYRO-005", SignalType.GYROSCOPE, 240.0, 0.69, 0.81, "handset-sensor-bus", "gyroscope drift consistent with passive audio reconstruction attempt"),
                new SignalSample("SIG-NIDS-006", SignalType.NETWORK, 1440.0, 0.88, 0.89, "egress-tap-9083", "fragmented packet stream may bypass naive IDS rule windows")
        );
    }

    public List<IntegrityStatus> integrity() {
        return List.of(
                new IntegrityStatus("patent-renderer.bin", "UNVERIFIED", "sha256:6f1b...9a2c", "missing", "2026-05-05T09:11:00+09:00", "FIM baseline absent for core binary"),
                new IntegrityStatus("viewer-watermark.policy", "MISSING", "sha256:none", "required", "2026-05-05T09:13:25+09:00", "digital watermark enforcement not found"),
                new IntegrityStatus("host-hids.rules", "DISABLED", "sha256:13be...44df", "sha256:13be...44df", "2026-05-05T09:15:40+09:00", "abnormal process detection disabled"),
                new IntegrityStatus("forensic-ledger.log", "TAMPER-SUSPECT", "sha256:ab77...02ac", "sha256:bb41...900e", "2026-05-05T09:17:10+09:00", "log deletion and timestamp skew detected")
        );
    }

    public List<SecurityEvent> events() {
        return List.of(
                new SecurityEvent("EVT-001", "2026-05-05T09:01:08+09:00", AlertSeverity.CRITICAL, "TEMPEST", "Screen-data electromagnetic leakage", "Viewer raster cadence visible in RF capture.", "Patent document viewer", "Shielded display path and emission baseline monitoring"),
                new SecurityEvent("EVT-002", "2026-05-05T09:04:22+09:00", AlertSeverity.HIGH, "Ultrasonic", "Unauthorized cross-device tracking", "19.85 kHz beacon observed near analysis station.", "Mobile sensor perimeter", "Ultrasonic filtering and microphone permission isolation"),
                new SecurityEvent("EVT-003", "2026-05-05T09:07:31+09:00", AlertSeverity.CRITICAL, "Power Analysis", "Key extraction trace", "Power variance aligned with cryptographic key schedule.", "Crypto worker", "Constant-time routines and power-line noise controls"),
                new SecurityEvent("EVT-004", "2026-05-05T09:09:18+09:00", AlertSeverity.HIGH, "Acoustic", "CPU audio waveform attack", "High-frequency CPU noise spikes during model ranking.", "Compute cluster", "Acoustic dampening and workload randomization"),
                new SecurityEvent("EVT-005", "2026-05-05T09:11:03+09:00", AlertSeverity.HIGH, "Gyroscope", "Mobile gyroscope eavesdropping", "Sensor drift maps to speech-band reconstruction risk.", "Nearby mobile device", "Sensor permission hardening and mobile exclusion zone"),
                new SecurityEvent("EVT-006", "2026-05-05T09:13:12+09:00", AlertSeverity.MEDIUM, "Capture API", "Screenshot exposure", "Secure screen-capture prevention API is not enforced.", "Patent viewer client", "Apply platform screen protection APIs"),
                new SecurityEvent("EVT-007", "2026-05-05T09:14:46+09:00", AlertSeverity.MEDIUM, "Watermark", "Document tracking gap", "Export path lacks forensic watermark insertion.", "Document export module", "Mandatory invisible watermark and recipient binding"),
                new SecurityEvent("EVT-008", "2026-05-05T09:17:10+09:00", AlertSeverity.CRITICAL, "Forensics", "Log deletion and timestamp manipulation", "Ledger sequence gap and clock skew observed.", "Forensic timeline", "Append-only remote logging and trusted timestamping"),
                new SecurityEvent("EVT-009", "2026-05-05T09:19:22+09:00", AlertSeverity.HIGH, "FIM", "Core binary tamper not detected", "No trusted baseline exists for renderer binary.", "Binary integrity monitor", "Enable file integrity monitoring with signed baselines"),
                new SecurityEvent("EVT-010", "2026-05-05T09:21:05+09:00", AlertSeverity.HIGH, "HIDS", "Abnormal process detection disabled", "Host-based rules are present but inactive.", "Host firewall", "Enable HIDS policy and process allow-listing"),
                new SecurityEvent("EVT-011", "2026-05-05T09:24:44+09:00", AlertSeverity.CRITICAL, "IDS/IPS", "Fragmented packet rule bypass", "Segmented egress flow avoids single-window signatures.", "Network inspection tap", "Normalize fragments before IDS rule evaluation")
        );
    }
}
