package com.holocomm.controller;

import com.holocomm.model.HoloModels.FaultScenario;
import com.holocomm.model.HoloModels.SystemStatus;
import com.holocomm.model.HoloModels.TelemetryFrame;
import com.holocomm.model.HoloModels.TerminalLog;
import com.holocomm.service.HoloSimulationService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HoloController {
  private final HoloSimulationService simulationService;

  public HoloController(HoloSimulationService simulationService) {
    this.simulationService = simulationService;
  }

  @GetMapping("/status")
  public SystemStatus status() {
    return simulationService.status();
  }

  @GetMapping("/telemetry")
  public TelemetryFrame telemetry() {
    return simulationService.telemetry();
  }

  @GetMapping("/scenarios")
  public List<FaultScenario> scenarios() {
    return simulationService.scenarios();
  }

  @GetMapping("/logs")
  public List<TerminalLog> logs() {
    return simulationService.logs();
  }
}
