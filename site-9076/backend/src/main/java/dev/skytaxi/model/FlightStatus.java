package dev.skytaxi.model;

import java.time.Instant;
import java.util.List;

public record FlightStatus(
        String service,
        String port,
        Instant timestamp,
        Weather weather,
        List<RouteNode> route,
        List<TaxiUnit> fleet,
        List<SystemLog> logs
) {
}
