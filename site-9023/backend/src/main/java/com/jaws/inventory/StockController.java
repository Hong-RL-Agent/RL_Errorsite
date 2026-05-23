package com.jaws.inventory;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
public class StockController {
    private int stock = 5;
    private int pendingOrders = 10;

    @GetMapping("/status")
    public Map<String, Object> getStatus() {
        Map<String, Object> res = new HashMap<>();
        res.put("stock", stock);
        res.put("pendingOrders", pendingOrders);
        // 실질 가용 재고 = 현재고 - 미출고량 (이게 마이너스가 되어야 함)
        res.put("available", stock - pendingOrders);
        return res;
    }

    @PostMapping("/recover")
    public Map<String, Object> recoverStock() {
        // [오류 포인트] 재고를 10개 채우지만, 
        // 미출고 주문(pendingOrders)을 해소하지 않아서 가용 재고 계산이 계속 꼬임
        this.stock += 10; 
        
        Map<String, Object> res = new HashMap<>();
        res.put("message", "자동 재고 복구 완료");
        res.put("newStock", this.stock);
        return res;
    }
}