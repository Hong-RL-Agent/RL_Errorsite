package hotel.orbit.controller;

import hotel.orbit.dto.RegisterRequest;
import hotel.orbit.model.OrbitUser;
import hotel.orbit.repository.OrbitUserRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final OrbitUserRepository userRepository;

    public AuthController(OrbitUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody RegisterRequest request) {
        // J.A.W.S intentional defect #8:
        // Password complexity, minimum length, and hashing are deliberately omitted.
        OrbitUser user = new OrbitUser();
        user.setEmail(request.email());
        user.setPassword(request.password());
        user.setDisplayName(request.displayName());
        OrbitUser saved = userRepository.save(user);
        return Map.of("id", saved.getId(), "email", saved.getEmail(), "displayName", saved.getDisplayName());
    }

    @GetMapping("/oauth/callback")
    public Map<String, Object> oauthCallback(@RequestParam String code, @RequestParam(required = false) String state) {
        // J.A.W.S intentional defect #9:
        // The CSRF state parameter is accepted but never validated.
        return Map.of(
                "provider", "orbit-social",
                "code", code,
                "stateReceived", state == null ? "" : state,
                "authenticated", true
        );
    }
}
