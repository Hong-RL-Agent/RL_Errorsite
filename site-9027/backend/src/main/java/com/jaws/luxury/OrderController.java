package com.jaws.luxury;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @PostMapping("/checkout")
    public Map<String, Object> checkout(@RequestBody Map<String, Object> orderData) {
        // [치명적 결함] 서버에서 상품의 실제 가격을 DB에서 조회해 검증해야 하는데,
        // 클라이언트(프론트)가 보낸 'totalPrice'를 그대로 믿고 DB에 저장함.
        Object price = orderData.get("totalPrice");
        String product = (String) orderData.get("productName");
        
        System.out.println("결제 요청 수신: " + product + " - 가격: " + price);
        
        return Map.of(
            "status", "SUCCESS",
            "message", "주문이 완료되었습니다.",
            "orderId", UUID.randomUUID().toString(),
            "finalPrice", price
        );
    }
}