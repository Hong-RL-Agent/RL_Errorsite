package com.aura.backend.controller;

import com.aura.backend.model.CartItemRequest;
import com.aura.backend.model.CartResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/v1/cart")
public class CartController {

    private final Map<String, Integer> totalsByUser = new ConcurrentHashMap<>();

    @PostMapping("/items")
    public CartResponse upsertItem(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
            @Valid @RequestBody CartItemRequest request
    ) {
        String userId = authorization == null ? "guest" : authorization.replace("Bearer ", "");
        int delta = request.quantity() * request.unitPrice();
        int total = totalsByUser.getOrDefault(userId, 0) + delta;
        totalsByUser.put(userId, total);
        return new CartResponse(userId, total);
    }
}
