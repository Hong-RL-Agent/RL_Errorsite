package edu.avcore.sandbox.regression;

import edu.avcore.sandbox.model.RegressionSignal;

public interface RegressionWorker {
    String id();

    String name();

    String subsystem();

    String description();

    boolean enabled();

    void setEnabled(boolean enabled);

    void tick();

    RegressionSignal signal();
}
