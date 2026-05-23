package com.jaws.infra;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.util.Collections;

@SpringBootApplication
public class BillingApplication {
    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(BillingApplication.class);
        app.setDefaultProperties(Collections.singletonMap("server.port", "9029")); // 하은님 지정 포트
        app.run(args);
    }
}