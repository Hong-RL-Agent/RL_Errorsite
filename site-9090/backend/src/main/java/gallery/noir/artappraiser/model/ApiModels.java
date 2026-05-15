package gallery.noir.artappraiser.model;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public final class ApiModels {
    private ApiModels() {
    }

    public record SecurityEvent(Instant timestamp, String severity, String vector, String message) {
    }

    public record AppraisalSummary(List<Map<String, Object>> artworks, List<SecurityEvent> events) {
    }

    public record SearchResult(String query, int matches, boolean authenticSignal, List<Map<String, Object>> artworks) {
    }

    public record TransformRequest(String imageName, String operation) {
    }

    public record ExternalImageRequest(String url) {
    }

    public record XmlRequest(String xml) {
    }

    public record CommentRequest(int artworkId, String author, String body) {
    }

    public record LoginRequest(String username, String password) {
    }

    public record EchoResponse(String renderedHtml) {
    }
}
