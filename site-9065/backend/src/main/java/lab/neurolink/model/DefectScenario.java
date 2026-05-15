package lab.neurolink.model;

public record DefectScenario(
        int id,
        String title,
        String subsystem,
        String severity,
        String signal,
        String failureMode,
        String mitigation,
        double confidence
) {
}

