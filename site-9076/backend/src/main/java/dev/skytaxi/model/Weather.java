package dev.skytaxi.model;

public record Weather(
        int windKph,
        int visibilityKm,
        String stormCell,
        int ceilingMeters,
        String routeRisk
) {
}
