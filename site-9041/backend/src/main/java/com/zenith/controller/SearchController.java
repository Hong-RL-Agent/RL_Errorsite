package com.zenith.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/search")
public class SearchController {

    private final JdbcTemplate jdbcTemplate;

    public SearchController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public List<Map<String, Object>> search(@RequestParam(required = false, defaultValue = "") String keyword) {
        // VULNERABILITY 260: SQL Injection
        // Deliberately concatenating user input to form the query
        String sql = "SELECT * FROM property WHERE location LIKE '%" + keyword + "%' OR name LIKE '%" + keyword + "%'";
        
        // This will throw an exception if the SQL is invalid, which is also a classic SQLi behavior
        return jdbcTemplate.queryForList(sql);
    }
    
    @GetMapping("/all")
    public List<Map<String, Object>> getAll() {
        return jdbcTemplate.queryForList("SELECT * FROM property");
    }
}
