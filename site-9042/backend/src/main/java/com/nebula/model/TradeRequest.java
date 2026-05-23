package com.nebula.model;

import lombok.Data;

@Data
public class TradeRequest {
    private String symbol;
    private String type; // "BUY" or "SELL"
    private double price;
    private double quantity;
    private String secretKey;
}
