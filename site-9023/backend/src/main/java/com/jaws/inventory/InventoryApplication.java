package com.jaws.inventory;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * JAWS Inventory Management System (#9023)
 * 메인 실행 클래스
 */
@SpringBootApplication
public class InventoryApplication {

    public static void main(String[] args) {
        // 애플리케이션 실행
        SpringApplication.run(InventoryApplication.class, args);
    }
}