package lab.skylogistics.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(StressProperties.class)
public class SkyLogisticsConfig {
}
