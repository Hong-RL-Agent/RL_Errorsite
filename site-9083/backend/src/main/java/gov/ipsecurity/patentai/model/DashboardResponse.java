package gov.ipsecurity.patentai.model;

import java.util.List;

public record DashboardResponse(
        String station,
        String port,
        PatentDocument document,
        List<SignalSample> signals,
        List<IntegrityStatus> integrity,
        List<SecurityEvent> events
) {
}
