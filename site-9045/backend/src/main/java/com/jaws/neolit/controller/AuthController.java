package com.jaws.neolit.controller;

import com.jaws.neolit.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestParam String email) {
        return ResponseEntity.ok(authService.loginAndSetContext(email));
    }

    @GetMapping("/me")
    public ResponseEntity<String> checkContext() {
        return ResponseEntity.ok("Current Context User: " + authService.getCurrentUserFromContext());
    }
}