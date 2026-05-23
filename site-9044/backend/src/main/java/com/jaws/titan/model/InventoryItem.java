package com.jaws.titan.model;

public class InventoryItem {
    private Long id;
    private String name;
    private int quantity;
    private String location;

    public InventoryItem(Long id, String name, int quantity, String location) {
        this.id = id;
        this.name = name;
        this.quantity = quantity;
        this.location = location;
    }
    // Getter, Setter 생략 (Lombok 사용 시 @Data 추가)
}