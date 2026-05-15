package dev.skytaxi.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "sky-taxi")
public class SkyTaxiProperties {
    private String baseUrl;
    private final Tls tls = new Tls();
    private final Training training = new Training();

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public Tls getTls() {
        return tls;
    }

    public Training getTraining() {
        return training;
    }

    public static class Tls {
        private String allowedProtocols;

        public String getAllowedProtocols() {
            return allowedProtocols;
        }

        public void setAllowedProtocols(String allowedProtocols) {
            this.allowedProtocols = allowedProtocols;
        }
    }

    public static class Training {
        private String predictableSessionPrefix;
        private String thirdPartyMapKey;

        public String getPredictableSessionPrefix() {
            return predictableSessionPrefix;
        }

        public void setPredictableSessionPrefix(String predictableSessionPrefix) {
            this.predictableSessionPrefix = predictableSessionPrefix;
        }

        public String getThirdPartyMapKey() {
            return thirdPartyMapKey;
        }

        public void setThirdPartyMapKey(String thirdPartyMapKey) {
            this.thirdPartyMapKey = thirdPartyMapKey;
        }
    }
}
