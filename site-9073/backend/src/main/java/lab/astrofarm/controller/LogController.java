package lab.astrofarm.controller;

import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/logs")
public class LogController {
    private final JdbcTemplate jdbcTemplate;

    public LogController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public Map<String, Object> search(@RequestParam(defaultValue = "") String q) {
        String vulnerableSql = "SELECT id, actor, message, created_at FROM user_logs WHERE message LIKE '%" + q
                + "%' ORDER BY created_at DESC";
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(vulnerableSql);
        return Map.of("query", vulnerableSql, "logs", rows);
    }

    @PostMapping
    public Map<String, Object> append(@RequestBody Map<String, String> body) {
        String actor = body.getOrDefault("actor", "trainee");
        String message = body.getOrDefault("message", "");
        jdbcTemplate.update("INSERT INTO user_logs(actor, message) VALUES (?, ?)", actor, message);
        return Map.of("stored", true, "sanitized", false, "message", message);
    }
}

