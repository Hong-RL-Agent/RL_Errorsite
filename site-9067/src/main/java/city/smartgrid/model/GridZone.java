package city.smartgrid.model;

import java.util.List;

public record GridZone(
    String id,
    String name,
    double load,
    double capacity,
    String status,
    List<Double> wave) {}
