package com.zenith.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/v1/checkout")
public class CheckoutController {

    @PostMapping
    public Map<String, Object> processCheckout(@RequestBody CheckoutRequest request) {
        int finalPrice = request.getBasePrice();
        
        // VULNERABILITY 270: Negative price logic
        // Applying discount without checking if final price drops below 0
        if ("DISCOUNT100K".equals(request.getCouponCode())) {
            finalPrice -= 100000;
        } else if ("MINUS999K".equals(request.getCouponCode())) {
            finalPrice -= 999000;
        }
        
        // Process payment... (mock)
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("finalPrice", finalPrice);
        response.put("message", "Payment processed successfully.");
        return response;
    }
}

class CheckoutRequest {
    private int propertyId;
    private int basePrice;
    private String couponCode;
    
    public int getPropertyId() { return propertyId; }
    public void setPropertyId(int propertyId) { this.propertyId = propertyId; }
    public int getBasePrice() { return basePrice; }
    public void setBasePrice(int basePrice) { this.basePrice = basePrice; }
    public String getCouponCode() { return couponCode; }
    public void setCouponCode(String couponCode) { this.couponCode = couponCode; }
}
