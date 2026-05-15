package lab.skylogistics.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "sky.stress")
public class StressProperties {
    private int tileCacheMb = 128;
    private int pidLimit = 32;

    public int getTileCacheMb() {
        return tileCacheMb;
    }

    public void setTileCacheMb(int tileCacheMb) {
        this.tileCacheMb = tileCacheMb;
    }

    public int getPidLimit() {
        return pidLimit;
    }

    public void setPidLimit(int pidLimit) {
        this.pidLimit = pidLimit;
    }
}
