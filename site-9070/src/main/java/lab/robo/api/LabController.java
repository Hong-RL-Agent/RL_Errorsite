package lab.robo.api;

import lab.robo.model.LabSnapshot;
import lab.robo.service.LabSimulationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class LabController {
    private final LabSimulationService simulationService;

    public LabController(LabSimulationService simulationService) {
        this.simulationService = simulationService;
    }

    @GetMapping("/lab/status")
    public LabSnapshot status() {
        return simulationService.snapshot();
    }

    @PostMapping("/scenarios/{scenarioId}/trigger")
    public Map<String, Object> trigger(@PathVariable int scenarioId) {
        return simulationService.trigger(scenarioId);
    }
}
