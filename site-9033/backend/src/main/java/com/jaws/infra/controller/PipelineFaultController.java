package com.jaws.infra.controller;

import java.time.Instant;
import java.util.Map;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PipelineFaultController {

    @GetMapping("/api/v1/pipeline/cached-error")
    public ResponseEntity<Map<String, Object>> cachedError() {
        Map<String, Object> body = Map.of(
                "status", "degraded",
                "message", "502 from downstream artifact registry",
                "timestamp", Instant.now().toString()
        );

        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .header(HttpHeaders.CACHE_CONTROL, CacheControl.maxAge(31536000, java.util.concurrent.TimeUnit.SECONDS)
                        .cachePublic()
                        .getHeaderValue())
                .body(body);
    }
}
