package com.jaws.infra;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class InfraApplication { // 파일 이름과 똑같이 InfraApplication이어야 합니다!
    public static void main(String[] args) {
        SpringApplication.run(InfraApplication.class, args);
    }
}