package com.jaws.infra;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class InfraApplication { // 클래스 이름을 파일명과 일치시킵니다.
    public static void main(String[] args) {
        SpringApplication.run(InfraApplication.class, args);
    }
}