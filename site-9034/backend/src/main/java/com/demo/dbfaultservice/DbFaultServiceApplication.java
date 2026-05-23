package com.demo.dbfaultservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DbFaultServiceApplication {

  public static void main(String[] args) {
    SpringApplication.run(DbFaultServiceApplication.class, args);
  }
}
