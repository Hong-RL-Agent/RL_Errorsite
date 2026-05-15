package com.spacemining.controller;

import com.spacemining.dto.MiningDashboardResponse;
import com.spacemining.service.DashboardService;
import com.spacemining.service.PerformanceFaultLab;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class MiningController {
    private final DashboardService dashboardService;
    private final PerformanceFaultLab faultLab;

    public MiningController(DashboardService dashboardService, PerformanceFaultLab faultLab) {
        this.dashboardService = dashboardService;
        this.faultLab = faultLab;
    }

    @GetMapping("/dashboard")
    public MiningDashboardResponse dashboard() {
        return dashboardService.dashboard();
    }

    @PostMapping("/faults/{type}")
    public Map<String, Object> triggerFault(@PathVariable String type) {
        return faultLab.trigger(type);
    }
}
