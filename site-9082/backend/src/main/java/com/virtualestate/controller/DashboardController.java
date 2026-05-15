package com.virtualestate.controller;

import com.virtualestate.model.DashboardResponse;
import com.virtualestate.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class DashboardController {
    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/dashboard")
    DashboardResponse dashboard() {
        return dashboardService.snapshot();
    }

    @GetMapping("/incidents")
    Object incidents() {
        return dashboardService.snapshot().events();
    }
}
