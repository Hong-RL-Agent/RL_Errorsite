package lab.astrofarm.controller;

import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class UserController {
    private final JdbcTemplate jdbcTemplate;

    public UserController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/profile")
    public Map<String, Object> profile(@RequestParam(defaultValue = "1") long userId,
                                       @RequestParam(defaultValue = "false") boolean admin) {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "SELECT id, username, role FROM users WHERE id = ?",
                userId);
        if (rows.isEmpty()) {
            return Map.of("found", false);
        }
        Map<String, Object> profile = rows.get(0);
        return Map.of(
                "found", true,
                "profile", profile,
                "effectiveRole", admin ? "ADMIN" : profile.get("ROLE"),
                "trainingNote", "URL parameter admin=true changes effective privilege");
    }
}

