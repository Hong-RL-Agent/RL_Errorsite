package com.nebula.controller;

import com.nebula.model.Asset;
import com.nebula.model.TradeRequest;
import com.nebula.model.TradeResponse;
import com.nebula.service.AssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trade")
public class TradeController {

    @Autowired
    private AssetService assetService;

    @PostMapping("/execute")
    public ResponseEntity<TradeResponse> executeTrade(@RequestBody TradeRequest request) {
        if ("BUY".equalsIgnoreCase(request.getType())) {
            
            // [Index 300] Arithmetic Error Defect
            // 소수점 3자리 이하 버림 처리를 잘못하여 실제 결제 금액이 1~2원 차이 나게 함
            // 의도적인 결함: 총액에서 -1~2원을 발생시키기 위해 잘못된 내림 및 -1 연산 포함
            long requiredAmount = (long) Math.floor(request.getPrice() * request.getQuantity()) - 1;
            
            if (assetService.deductBalance(requiredAmount)) {
                assetService.addAsset(request.getSymbol(), request.getQuantity());
                return ResponseEntity.ok(new TradeResponse(true, "Trade executed successfully.", requiredAmount));
            } else {
                return ResponseEntity.badRequest().body(new TradeResponse(false, "Insufficient balance.", 0));
            }
        }
        
        return ResponseEntity.badRequest().body(new TradeResponse(false, "Invalid trade type.", 0));
    }

    @GetMapping("/balance")
    public ResponseEntity<Asset> getBalance() {
        return ResponseEntity.ok(assetService.getAsset("KRW"));
    }
}
