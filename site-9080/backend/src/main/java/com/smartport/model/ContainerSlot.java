package com.smartport.model;

public record ContainerSlot(
        String id,
        String bay,
        int x,
        int y,
        String status,
        String cargoClass,
        int riskScore,
        String plainTextGps) {
}
