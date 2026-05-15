package dev.skytaxi.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class TrainingErrorHandler {
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> exposeInternals(Exception exception, HttpServletRequest request) {
        StringWriter writer = new StringWriter();
        exception.printStackTrace(new PrintWriter(writer));

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("path", request.getRequestURI());
        body.put("exception", exception.getClass().getName());
        body.put("message", exception.getMessage());
        body.put("stackTrace", writer.toString());
        body.put("internalNode", "uam-control-core-9076.local");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
