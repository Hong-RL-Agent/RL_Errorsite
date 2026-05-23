package com.jaws.audit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * JAWS Cloud Console - Security Audit (#9024)
 * 보안 격리 테스트를 위한 메인 엔진
 */
@SpringBootApplication
public class AuditApplication {
    public static void main(String[] args) {
        SpringApplication.run(AuditApplication.class, args);
    }
}