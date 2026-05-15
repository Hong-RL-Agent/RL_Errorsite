package lab.cyber;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class CyberLabApplication {
    public static void main(String[] args) {
        SpringApplication.run(CyberLabApplication.class, args);
    }
}
