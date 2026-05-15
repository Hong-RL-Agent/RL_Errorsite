package gallery.noir.artappraiser.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Value("${app.public-origin:http://localhost:9090}")
    private String publicOrigin;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(publicOrigin, "http://localhost:9090")
                .allowedMethods("*")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
