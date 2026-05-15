package city.smartgrid.model;

import java.time.Instant;
import java.util.List;

public record GridSnapshot(
    Instant timestamp,
    double totalMegawatts,
    double stabilityIndex,
    double npuLoad,
    List<GridZone> zones,
    List<WorkerState> workers) {}
