package com.jaws.titan.controller;

// 💡 아래 두 줄이 추가되었습니다!
import com.jaws.titan.model.InventoryItem; 
import java.util.List;

import com.jaws.titan.service.InventoryService;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class InventoryController {
    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/inventory")
    public List<InventoryItem> getInventory() {
        return inventoryService.getAllInventory();
    }

    // [Index 410] 수량 업데이트 결함: 콤마(,)가 포함된 문자열 처리 시 에러 발생
    @PostMapping("/inventory/update/{id}")
    public String updateStock(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String qtyStr = payload.get("quantity"); // 프론트에서 "1,250"이 들어옴
        // Integer.parseInt()는 콤마를 처리 못 하므로 여기서 NumberFormatException(500 에러) 발생
        int qty = Integer.parseInt(qtyStr); 
        return "Updated to " + qty;
    }

    // [Index 430] IDOR 보안 취약점: 권한 체크 없이 ID만으로 파일 다운로드 허용
    @GetMapping("/reports/download")
    public String downloadReport(@RequestParam Long id) {
        // 원래는 현재 로그인한 사용자가 id번에 접근 권한이 있는지 확인해야 함 (누락됨)
        return "Confidential Report for Asset ID: " + id + " - [Internal Data Exposed]";
    }
}