package city.smartgrid.model;

public record RegressionScenario(
    int id,
    String title,
    String layer,
    String trigger,
    String expectedFailure,
    String detector,
    String severity) {}
