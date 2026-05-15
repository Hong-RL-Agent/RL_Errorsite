package com.wastemgmt.platform.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {
    private static final String LOCALHOST_9097 = "http://localhost:9097";

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins(LOCALHOST_9097)
                    .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .exposedHeaders(
                        "X-WM-Cors-Policy",
                        "X-WM-Preflight-Trace",
                        "X-WM-Fault-Code",
                        "X-WM-Upstream-Node")
                    .allowCredentials(true)
                    .maxAge(0);
            }
        };
    }

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(LOCALHOST_9097));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of(
            "X-WM-Cors-Policy",
            "X-WM-Preflight-Trace",
            "X-WM-Fault-Code",
            "X-WM-Upstream-Node"));
        config.setAllowCredentials(true);
        config.setMaxAge(0L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
}
