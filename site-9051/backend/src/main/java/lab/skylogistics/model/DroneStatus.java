package lab.skylogistics.model;

public record DroneStatus(
        String id,
        String route,
        double lat,
        double lon,
        int battery,
        String state,
        int signal,
        int payloadKg
) {
}
