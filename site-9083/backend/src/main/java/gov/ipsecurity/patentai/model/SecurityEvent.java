package gov.ipsecurity.patentai.model;

public record SecurityEvent(
        String id,
        String timestamp,
        AlertSeverity severity,
        String vector,
        String title,
        String finding,
        String affectedAsset,
        String recommendedControl
) {
}
