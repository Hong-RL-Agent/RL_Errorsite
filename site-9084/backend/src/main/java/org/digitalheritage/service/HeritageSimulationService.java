package org.digitalheritage.service;

import org.digitalheritage.model.ArchiveEvent;
import org.digitalheritage.model.ContinuityMetric;
import org.digitalheritage.model.DisasterLog;
import org.digitalheritage.model.HeritageDashboard;
import org.digitalheritage.model.SocSignal;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class HeritageSimulationService {
    private static final DateTimeFormatter CLOCK = DateTimeFormatter.ofPattern("HH:mm:ss");

    public HeritageDashboard dashboard() {
        return new HeritageDashboard(
                "DIGITAL-HERITAGE",
                "http://localhost:9084",
                "Sepia Vault Continuity Drill",
                timeline(),
                metrics(),
                socSignals(),
                logs()
        );
    }

    private List<ArchiveEvent> timeline() {
        return List.of(
                new ArchiveEvent("era-01", "1450", "Incunabula Registry", "Early printed archive batches mirrored from fragile optical media.", 96, "stable", 12, 62),
                new ArchiveEvent("era-02", "1910", "Civic Census Vault", "Legacy platform migration detected field-order divergence in citizen records.", 68, "consistency", 31, 39),
                new ArchiveEvent("era-03", "1978", "Magnetic Tape Annex", "Cold backup tape media shows oxide shedding after humidity excursion.", 42, "media", 47, 70),
                new ArchiveEvent("era-04", "2004", "Web Memory Wing", "WAF bypass pattern crossed the archive gateway with low inspection score.", 53, "waf", 66, 34),
                new ArchiveEvent("era-05", "2026", "Continuity Core", "Ransomware simulation encrypted hot backup and delayed DR orchestration.", 24, "critical", 86, 57)
        );
    }

    private List<ContinuityMetric> metrics() {
        return List.of(
                new ContinuityMetric("RTO", 19, 8, "hours", "breach", "Service restoration is exceeding the approved recovery window."),
                new ContinuityMetric("RPO", 37, 4, "hours", "breach", "Backup cadence error created a wide data-loss interval."),
                new ContinuityMetric("Replica Integrity", 71, 99, "%", "degraded", "Cross-era checksums disagree during legacy migration."),
                new ContinuityMetric("Cold Tape Health", 46, 95, "%", "critical", "Physical storage condition is below preservation tolerance.")
        );
    }

    private List<SocSignal> socSignals() {
        return List.of(
                new SocSignal("soc-001", "WAF", "HIGH", "Canonicalization gap exposed bypass string family", "missed", 41, "WAF detection blind spot"),
                new SocSignal("soc-002", "SIEM", "MEDIUM", "False-positive storm buried credential replay indicator", "overloaded", 27, "SIEM false positives"),
                new SocSignal("soc-003", "NOC", "HIGH", "Night shift vacancy delayed incident acknowledgement", "delayed", 34, "Unstaffed overnight monitoring"),
                new SocSignal("soc-004", "IRP", "CRITICAL", "No approved response playbook for archive encryption event", "failed", 18, "Missing IRP manual"),
                new SocSignal("soc-005", "DR", "CRITICAL", "Mock recovery gap left restore engine halted", "stalled", 22, "Untested DR engine")
        );
    }

    private List<DisasterLog> logs() {
        String now = LocalTime.now().format(CLOCK);
        return List.of(
                new DisasterLog(now, "BCP", "WARN", "Offsite replica not found; flood-zone vault and primary store share blast radius."),
                new DisasterLog("02:13:44", "SOC", "ERROR", "Night watch queue exceeded 312 minutes before human acknowledgement."),
                new DisasterLog("02:47:19", "WAF", "WARN", "Encoded traversal probe normalized after inspection stage; request marked benign."),
                new DisasterLog("03:02:10", "BACKUP", "CRITICAL", "Ransomware drill reached backup server; snapshot catalog encrypted."),
                new DisasterLog("03:38:25", "DR", "ERROR", "Restore engine stopped at preflight: last mock exercise older than policy."),
                new DisasterLog("04:21:56", "ARCHIVE", "ERROR", "Legacy migration checksum mismatch across 14,208 cultural records.")
        );
    }
}
