package city.smartgrid.api;

import city.smartgrid.model.GridSnapshot;
import city.smartgrid.model.RegressionScenario;
import city.smartgrid.service.GridTelemetryService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class GridController {
  private final GridTelemetryService telemetryService;

  public GridController(GridTelemetryService telemetryService) {
    this.telemetryService = telemetryService;
  }

  @GetMapping("/grid/snapshot")
  public GridSnapshot snapshot() {
    return telemetryService.snapshot();
  }

  @GetMapping("/grid/regressions")
  public List<RegressionScenario> regressions() {
    return telemetryService.regressions();
  }
}
