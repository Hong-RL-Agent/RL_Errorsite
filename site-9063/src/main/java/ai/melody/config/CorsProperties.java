package ai.melody.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "melody-ai.cors")
public record CorsProperties(List<String> allowedOrigins) {
}
