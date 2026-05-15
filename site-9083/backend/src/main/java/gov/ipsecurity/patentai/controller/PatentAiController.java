package gov.ipsecurity.patentai.controller;

import gov.ipsecurity.patentai.model.DashboardResponse;
import gov.ipsecurity.patentai.model.IntegrityStatus;
import gov.ipsecurity.patentai.model.PatentDocument;
import gov.ipsecurity.patentai.model.SecurityEvent;
import gov.ipsecurity.patentai.model.SignalSample;
import gov.ipsecurity.patentai.service.SimulationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class PatentAiController {
    private final SimulationService simulationService;

    public PatentAiController(SimulationService simulationService) {
        this.simulationService = simulationService;
    }

    @GetMapping("/dashboard")
    public DashboardResponse dashboard() {
        return simulationService.dashboard();
    }

    @GetMapping("/document")
    public PatentDocument document() {
        return simulationService.document();
    }

    @GetMapping("/signals")
    public List<SignalSample> signals() {
        return simulationService.signals();
    }

    @GetMapping("/integrity")
    public List<IntegrityStatus> integrity() {
        return simulationService.integrity();
    }

    @GetMapping("/events")
    public List<SecurityEvent> events() {
        return simulationService.events();
    }
}
