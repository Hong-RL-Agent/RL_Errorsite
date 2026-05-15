package com.airecruiter.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "ai-recruiter")
public class AiRecruiterProperties {

    private boolean requireApiKey;
    private String apiKey = "";
    private int gpuCount = 2;
    private boolean cpuPatched = true;
    private boolean trrEnabled = true;

    public boolean isRequireApiKey() {
        return requireApiKey;
    }

    public void setRequireApiKey(boolean requireApiKey) {
        this.requireApiKey = requireApiKey;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public int getGpuCount() {
        return gpuCount;
    }

    public void setGpuCount(int gpuCount) {
        this.gpuCount = gpuCount;
    }

    public boolean isCpuPatched() {
        return cpuPatched;
    }

    public void setCpuPatched(boolean cpuPatched) {
        this.cpuPatched = cpuPatched;
    }

    public boolean isTrrEnabled() {
        return trrEnabled;
    }

    public void setTrrEnabled(boolean trrEnabled) {
        this.trrEnabled = trrEnabled;
    }
}
