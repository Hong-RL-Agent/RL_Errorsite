package com.fuzzing.agent.controller;

import com.fuzzing.agent.service.TradingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/trading")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TradingController {
    private final TradingService tradingService;

    @GetMapping("/dashboard/{userId}")
    public ResponseEntity<Map<String, Object>> getDashboard(@PathVariable Long userId) {
        try {
            Map<String, Object> dashboard = tradingService.getUserDashboard(userId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", dashboard
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/withdraw")
    public ResponseEntity<Map<String, Object>> withdraw(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.parseLong(payload.get("userId").toString());
            BigDecimal amount = new BigDecimal(payload.get("amount").toString());

            Map<String, Object> result = tradingService.withdraw(userId, amount);
            return ResponseEntity.ok(Map.of(
                "success", (Boolean) result.get("success"),
                "data", result
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/deposit")
    public ResponseEntity<Map<String, Object>> deposit(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.parseLong(payload.get("userId").toString());
            BigDecimal amount = new BigDecimal(payload.get("amount").toString());

            Map<String, Object> result = tradingService.deposit(userId, amount);
            return ResponseEntity.ok(Map.of(
                "success", (Boolean) result.get("success"),
                "data", result
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/buy-item")
    public ResponseEntity<Map<String, Object>> buyItem(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.parseLong(payload.get("userId").toString());
            String itemName = payload.get("itemName").toString();
            Long quantity = Long.parseLong(payload.get("quantity").toString());
            BigDecimal pointCost = new BigDecimal(payload.get("pointCost").toString());

            Map<String, Object> result = tradingService.buyItem(userId, itemName, quantity, pointCost);
            return ResponseEntity.ok(Map.of(
                "success", (Boolean) result.get("success"),
                "data", result
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/trigger-starvation/{userId}")
    public ResponseEntity<Map<String, Object>> triggerStarvation(@PathVariable Long userId) {
        try {
            Map<String, Object> result = tradingService.triggerStarvation(userId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/release-starvation/{userId}")
    public ResponseEntity<Map<String, Object>> releaseStarvation(@PathVariable Long userId) {
        try {
            Map<String, Object> result = tradingService.releaseStarvation(userId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
}
