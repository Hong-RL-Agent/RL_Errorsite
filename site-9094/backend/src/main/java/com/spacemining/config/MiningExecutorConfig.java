package com.spacemining.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

@Configuration
public class MiningExecutorConfig {
    @Bean
    public ThreadPoolExecutor miningExecutor() {
        return new ThreadPoolExecutor(
                3,
                3,
                10,
                TimeUnit.SECONDS,
                new ArrayBlockingQueue<>(4),
                new ThreadPoolExecutor.AbortPolicy()
        );
    }
}
