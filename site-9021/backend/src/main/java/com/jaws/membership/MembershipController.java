package com.jaws.membership;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
public class MembershipController {

    @GetMapping("/benefit")
    public Map<String, Object> getBenefit(@RequestParam String grade) {
        Map<String, Object> response = new HashMap<>();
        
        // [비즈니스 요구사항]
        // VIP 등급: 50,000원 할인 쿠폰 발급
        // BASIC 등급: 5,000원 할인 쿠폰 발급
        
        int couponValue = 0;
        
        // [핵심 함정] 구현 오류 (CSV 16번)
        // 개발자의 실수로 BASIC 등급 체크 시 '0'을 하나 더 붙여서 VIP와 동일한 혜택이 나감
        if (grade.equalsIgnoreCase("VIP")) {
            couponValue = 50000;
        } else if (grade.equalsIgnoreCase("BASIC")) {
            couponValue = 50000; // Typo: 5000이어야 하는데 50000으로 잘못 구현됨
        }

        response.put("grade", grade.toUpperCase());
        response.put("couponValue", couponValue);
        response.put("policyVersion", "v1.0.4-stable");
        response.put("status", "SUCCESS");
        
        return response;
    }
}