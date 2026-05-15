package com.newsfeed.security;

import com.newsfeed.security.ApiModels.DashboardPayload;
import com.newsfeed.security.ApiModels.IncidentPattern;
import com.newsfeed.security.ApiModels.InventoryItem;
import com.newsfeed.security.ApiModels.NetworkTrace;
import com.newsfeed.security.ApiModels.NewsItem;
import com.newsfeed.security.ApiModels.PreferenceMetric;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class DashboardController {
    private final DashboardService service;

    public DashboardController(DashboardService service) {
        this.service = service;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "degraded-simulation", "port", "9078", "service", "NEWS-FEED");
    }

    @GetMapping("/dashboard")
    public DashboardPayload dashboard() {
        return service.payload();
    }

    @GetMapping("/news")
    public List<NewsItem> news() {
        return service.news();
    }

    @GetMapping("/preferences")
    public List<PreferenceMetric> preferences() {
        return service.preferences();
    }

    @GetMapping("/inventory")
    public List<InventoryItem> inventory() {
        return service.inventory();
    }

    @GetMapping("/network-traces")
    public List<NetworkTrace> traces() {
        return service.traces();
    }

    @GetMapping("/incidents")
    public List<IncidentPattern> incidents() {
        return service.incidents();
    }
}
