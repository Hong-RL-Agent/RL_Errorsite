package city.smartgrid.model;

public record WorkerState(
    String id,
    String lane,
    String state,
    int queueDepth,
    long lastMessageId,
    String risk) {}
