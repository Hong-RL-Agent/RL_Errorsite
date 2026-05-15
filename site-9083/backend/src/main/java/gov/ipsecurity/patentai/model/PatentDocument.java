package gov.ipsecurity.patentai.model;

import java.util.List;

public record PatentDocument(
        String id,
        String classification,
        String title,
        String abstractText,
        List<String> claims,
        List<String> sensitiveMarkers
) {
}
