package org.digitalheritage.model;

import java.util.List;

public record HeritageDashboard(
        String institution,
        String baseUrl,
        String preservationMode,
        List<ArchiveEvent> timeline,
        List<ContinuityMetric> metrics,
        List<SocSignal> socSignals,
        List<DisasterLog> disasterLogs
) {
}
