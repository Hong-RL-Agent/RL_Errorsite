package com.nebula.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TradeResponse {
    private boolean success;
    private String message;
    private long paymentProcessed;
}
