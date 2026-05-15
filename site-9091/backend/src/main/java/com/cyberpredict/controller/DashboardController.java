package com.cyberpredict.controller;

import com.cyberpredict.model.DashboardModels.DashboardSnapshot;
import com.cyberpredict.service.CyberPredictionService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class DashboardController {
    private final CyberPredictionService predictionService;

    public DashboardController(CyberPredictionService predictionService) {
        this.predictionService = predictionService;
    }

    @GetMapping("/dashboard")
    public DashboardSnapshot dashboard() {
        return predictionService.snapshot();
    }
}
