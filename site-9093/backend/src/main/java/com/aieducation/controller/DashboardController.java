package com.aieducation.controller;

import com.aieducation.model.DashboardSnapshot;
import com.aieducation.model.SecurityLog;
import com.aieducation.model.TrainingScenario;
import com.aieducation.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class DashboardController {
    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/dashboard")
    public DashboardSnapshot dashboard() {
        return dashboardService.snapshot();
    }

    @GetMapping("/logs/security")
    public List<SecurityLog> logs() {
        return dashboardService.securityLogs();
    }

    @GetMapping("/training/scenarios")
    public List<TrainingScenario> scenarios() {
        return dashboardService.scenarios();
    }
}
