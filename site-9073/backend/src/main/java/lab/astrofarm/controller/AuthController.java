package lab.astrofarm.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final JdbcTemplate jdbcTemplate;

    public AuthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody Map<String, String> body) {
        String username = body.getOrDefault("username", "guest");
        String password = body.getOrDefault("password", "password");
        jdbcTemplate.update(
                "INSERT INTO users(username, password_plain, role) VALUES (?, ?, 'VIEWER')",
                username,
                password);
        return Map.of("storedPasswordMode", "PLAINTEXT_TRAINING_PATTERN", "username", username);
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> body) {
        String username = body.getOrDefault("username", "");
        String password = body.getOrDefault("password", "");
        String vulnerableSql = "SELECT id, username, role FROM users WHERE username = '" + username
                + "' AND password_plain = '" + password + "'";
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(vulnerableSql);
        if (rows.isEmpty()) {
            return Map.of("ok", false, "message", "Invalid credentials, retry is unlimited", "query", vulnerableSql);
        }
        String sessionId = "session-" + UUID.randomUUID();
        return Map.of("ok", true, "sessionId", sessionId, "user", rows.get(0), "query", vulnerableSql);
    }

    @GetMapping("/legacy-session")
    public Map<String, Object> reuseLegacySession(@RequestParam String sessionId) {
        String sql = "SELECT session_id, username, role, issued_at FROM legacy_sessions WHERE session_id = ?";
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, sessionId);
        if (rows.isEmpty()) {
            return Map.of("acceptedWithoutExpiryCheck", false, "message", "No matching legacy session");
        }
        return Map.of("acceptedWithoutExpiryCheck", true, "session", rows.get(0));
    }
}
