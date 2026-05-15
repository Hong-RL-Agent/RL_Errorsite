package com.airecruiter.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class ApiKeyStartupValidator implements ApplicationRunner {

    private final AiRecruiterProperties properties;

    public ApiKeyStartupValidator(AiRecruiterProperties properties) {
        this.properties = properties;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (properties.isRequireApiKey() && !StringUtils.hasText(properties.getApiKey())) {
            throw new IllegalStateException("AI_RECRUITER_API_KEY is required but was not loaded");
        }
    }
}
