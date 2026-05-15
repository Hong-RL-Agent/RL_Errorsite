package lab.cyber.model;

public record DefensePosture(
        String mode,
        int packetInspection,
        int quarantineLevel,
        boolean autoContainment,
        boolean silentBreakerProbe
) {
    public static DefensePosture defaults() {
        return new DefensePosture("WATCH", 62, 35, true, false);
    }
}
