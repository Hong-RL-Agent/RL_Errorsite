package com.jaws.infra.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/billing")
public class BillingController {

    // Index 180: 가격 변조 취약점 (클라이언트 전송 가격 무조건 수용)
    @PostMapping("/checkout")
    public Map<String, Object> processPayment(@RequestBody Map<String, Object> paymentData) {
        Map<String, Object> res = new HashMap<>();
        Object amount = paymentData.get("amount");
        
        // 결함: DB의 정가와 비교하지 않고 클라이언트가 보낸 amount를 그대로 결제 처리
        res.put("status", "SUCCESS");
        res.put("processed_amount", amount);
        res.put("transaction_id", UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        return res;
    }

    // Index 185: 쿠폰 무차별 대입 (Rate Limit 없음)
    @PostMapping("/coupon/apply")
    public Map<String, Object> applyCoupon(@RequestParam String code) {
        Map<String, Object> res = new HashMap<>();
        if ("DISCOUNT99".equals(code)) {
            res.put("valid", true);
            res.put("discount_percent", 99);
        } else {
            res.put("valid", false);
            res.put("error", "Invalid Coupon Code");
        }
        return res;
    }
}