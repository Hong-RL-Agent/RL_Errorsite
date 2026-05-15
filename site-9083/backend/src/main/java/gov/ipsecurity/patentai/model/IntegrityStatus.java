package gov.ipsecurity.patentai.model;

public record IntegrityStatus(
        String component,
        String status,
        String hash,
        String baseline,
        String lastVerified,
        String note
) {
}
