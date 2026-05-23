package com.demo.dbfaultservice.controller;

import com.demo.dbfaultservice.service.FaultSimulationService;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class FaultDashboardController {

  private final FaultSimulationService faultSimulationService;

  public FaultDashboardController(FaultSimulationService faultSimulationService) {
    this.faultSimulationService = faultSimulationService;
  }

  @GetMapping("/health")
  public Map<String, Object> health() {
    return Map.of("status", "ok", "service", "db-fault-service");
  }

  @GetMapping("/latency")
  public List<Map<String, Object>> latency() {
    return faultSimulationService.getLatencySeries();
  }

  @GetMapping("/accounts")
  public Map<String, Object> accounts(@RequestParam(defaultValue = "6") int size) {
    return faultSimulationService.getAccountsWithNPlusOne(size);
  }

  @PostMapping("/transfer")
  public Map<String, Object> transfer(@RequestBody TransferRequest request) {
    return faultSimulationService.simulateDirtyReadTransfer(request.fromId(), request.toId(), request.amount());
  }

  @GetMapping("/deadlock")
  public Map<String, Object> deadlock() {
    return faultSimulationService.getDeadlockStatus();
  }

  @GetMapping("/debug/sql")
  public List<String> sqlDebug() {
    return faultSimulationService.getSqlLog();
  }

  public record TransferRequest(long fromId, long toId, double amount) {
  }
}
