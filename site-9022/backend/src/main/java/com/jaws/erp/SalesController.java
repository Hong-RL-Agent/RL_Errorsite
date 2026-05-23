package com.jaws.erp;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
public class SalesController {

    @GetMapping("/sales-report")
    public Map<String, Object> getSalesReport() {
        // [데이터 세팅] 4개 지점이 각각 2,500만원씩 매출 발생 (총 1억원이어야 함)
        List<Integer> branchSales = Arrays.asList(25000000, 25000000, 25000000, 25000000);
        
        // 매출 합산 로직 호출
        int totalRevenue = aggregateSales(branchSales);

        Map<String, Object> response = new HashMap<>();
        response.put("totalRevenue", totalRevenue);
        response.put("branchCount", branchSales.size());
        response.put("calculationMethod", "Distributed-Parallel-Merge"); // 분할 정복 느낌의 명칭
        response.put("status", "COMPLETED");
        
        return response;
    }

    /**
     * 지점별 매출을 합산하는 메소드
     */
    private int aggregateSales(List<Integer> sales) {
        int sum = 0;
        
        // [핵심 함정] 분할 정복 오류 (CSV 17번)
        // i < sales.size() 가 정상인데, 실수로 - 1을 붙임.
        // 이로 인해 마지막 인덱스의 데이터가 합계에 포함되지 않습니다.
        for (int i = 0; i < sales.size() - 1; i++) { 
            sum += sales.get(i);
        }
        
        return sum;
    }
}