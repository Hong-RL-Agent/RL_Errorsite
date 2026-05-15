package com.deepsea.data;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class DeepSeaDataApplication {

    public static void main(String[] args) {
        SpringApplication.run(DeepSeaDataApplication.class, args);
    }
}
