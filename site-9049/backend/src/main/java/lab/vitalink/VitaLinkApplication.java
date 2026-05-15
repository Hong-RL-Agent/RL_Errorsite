package lab.vitalink;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class VitaLinkApplication {
    public static void main(String[] args) {
        SpringApplication.run(VitaLinkApplication.class, args);
    }
}
