package lab.cyber.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "cyber-lab")
public class CyberLabProperties {
    private String runtimeDir = "./runtime";

    public String getRuntimeDir() {
        return runtimeDir;
    }

    public void setRuntimeDir(String runtimeDir) {
        this.runtimeDir = runtimeDir;
    }
}
