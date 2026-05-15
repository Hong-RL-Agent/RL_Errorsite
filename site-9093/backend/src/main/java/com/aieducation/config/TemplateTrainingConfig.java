package com.aieducation.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.thymeleaf.templateresolver.StringTemplateResolver;

@Configuration
public class TemplateTrainingConfig {
    @Bean
    public StringTemplateResolver stringTemplateResolver() {
        StringTemplateResolver resolver = new StringTemplateResolver();
        resolver.setTemplateMode("HTML");
        resolver.setCacheable(false);
        resolver.setOrder(1);
        return resolver;
    }
}
