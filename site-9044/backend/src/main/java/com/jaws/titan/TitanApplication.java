package com.jaws.titan;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TitanApplication {

    public static void main(String[] args) {
        // TITAN 백엔드 시스템(포트 8080)을 구동합니다.
        SpringApplication.run(TitanApplication.class, args);
        System.out.println("🚀 TITAN Backend Application Started Successfully!");
    }

}