package com.jaws.titan.service;

import com.jaws.titan.model.InventoryItem;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class InventoryService {
    public List<InventoryItem> getAllInventory() {
        List<InventoryItem> items = Arrays.asList(
            new InventoryItem(1024L, "Industrial Motor", 1250, "Zone-A"),
            new InventoryItem(1025L, "Pressure Sensor", 840, "Zone-B")
        );

        // [Index 440] 의도적인 N+1 지연 시뮬레이션
        // 각 아이템을 처리할 때마다 1초씩 강제로 쉬게 만들어 성능 결함을 유도합니다.
        for (InventoryItem item : items) {
            try { Thread.sleep(1000); } catch (InterruptedException e) {}
        }
        return items;
    }
}