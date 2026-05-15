package lab.lexai.config;

import lab.lexai.simulation.RequestLatencyInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    private final RequestLatencyInterceptor requestLatencyInterceptor;

    public WebConfig(RequestLatencyInterceptor requestLatencyInterceptor) {
        this.requestLatencyInterceptor = requestLatencyInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(requestLatencyInterceptor).addPathPatterns("/api/**");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:9048", "http://127.0.0.1:9048")
                .allowedMethods("*")
                .allowedHeaders("*");
    }
}
