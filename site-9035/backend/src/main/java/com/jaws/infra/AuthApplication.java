package com.jaws.infra;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.util.Collections;

@SpringBootApplication
public class AuthApplication {
    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(AuthApplication.class);
        // 하은님 요청에 따라 백엔드 포트를 9029로 설정
        app.setDefaultProperties(Collections.singletonMap("server.port", "9029"));
        app.run(args);
    }
}