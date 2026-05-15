package edu.abyssal.deepsea.web;

import edu.abyssal.deepsea.model.CoreStatus;
import edu.abyssal.deepsea.service.DeepSeaControlService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/core")
public class DeepSeaControlController {
    private final DeepSeaControlService controlService;

    public DeepSeaControlController(DeepSeaControlService controlService) {
        this.controlService = controlService;
    }

    @GetMapping("/status")
    public CoreStatus status() {
        return controlService.currentStatus();
    }
}
