package com.site9037.backend.controller;

import com.site9037.backend.service.SimulationService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class SimulationController {

    private final SimulationService simulationService;

    public SimulationController(SimulationService simulationService) {
        this.simulationService = simulationService;
    }

    @GetMapping("/overview")
    public Map<String, Object> getOverview() {
        return simulationService.overview();
    }

    @PostMapping("/faults/{index}/trigger")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public Map<String, Object> triggerFault(@PathVariable int index) {
        return simulationService.triggerFault(index);
    }

    @PostMapping("/faults/{index}/reset")
    public Map<String, Object> resetFault(@PathVariable int index) {
        return simulationService.resetFault(index);
    }
}

