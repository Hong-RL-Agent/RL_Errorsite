package com.autotruck.control;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataIntegrityLogger implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger("AUTO_TRUCK_DATA_INTEGRITY_9088");

    @Override
    public void run(String... args) {
        log.info("AUTO-TRUCK regression stream initialized on public origin http://localhost:9088");
        log.info("Data integrity probes enabled: sse-order, long-poll-timeout, timezone, float, bigint, cors-canvas");
    }
}

