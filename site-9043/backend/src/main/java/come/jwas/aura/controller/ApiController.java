package com.jaws.aura.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
public class ApiController {

    /**
     * 시스템 헬스 체크 엔드포인트
     */
    @GetMapping("/health")
    public Map<String, Object> healthCheck() {
        Map<String, Object> status = new HashMap<>();
        // ✅ 수정됨: Map에는 add()가 아니라 put()을 사용해야 합니다.
        status.put("status", "UP");
        status.put("service", "AURA-Premium-Perfume");
        status.put("version", "1.0.0");
        return status;
    }

    /**
     * 추천 상품 리스트 (Shop 페이지용)
     */
    @GetMapping("/products/featured")
    public List<Map<String, Object>> getFeaturedProducts() {
        List<Map<String, Object>> products = new ArrayList<>();
        products.add(createProduct(1, "Mystic Wood", 185000));
        products.add(createProduct(2, "Velvet Rose", 210000));
        products.add(createProduct(3, "Midnight Amber", 155000));
        return products;
    }

    /**
     * [Index 360] 보안 결함: 인증 절차 없이 관리자 전용 주문 내역 노출
     * QA 에이전트가 이 엔드포인트를 통해 민감 정보(이름, 주소)가 유출됨을 감지해야 함.
     */
    @GetMapping("/admin/orders/all")
    public List<Map<String, String>> getInsecureOrderHistory() {
        return List.of(
            Map.of("orderId", "A-9043-01", "customer", "하은", "address", "서울특별시 강남구...", "total", "370,000"),
            Map.of("orderId", "A-9043-02", "customer", "신우", "address", "경기도 성남시...", "total", "155,000"),
            // ✅ 수정됨: 괄호와 따옴표가 깨져있던 문법 오류를 수정했습니다.
            Map.of("orderId", "A-9043-03", "customer", "지나", "address", "부산광역시 수영구...", "total", "210,000")
        );
    }

    // 상품 객체 생성을 위한 헬퍼 메소드
    private Map<String, Object> createProduct(int id, String name, int price) {
        Map<String, Object> product = new HashMap<>();
        product.put("id", id);
        product.put("name", name);
        product.put("price", price);
        return product;
    }
}