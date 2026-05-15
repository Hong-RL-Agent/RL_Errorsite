package edu.avcore.sandbox.regression;

import edu.avcore.sandbox.model.RegressionSignal;

import java.util.Locale;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.LongAdder;

abstract class AbstractRegressionWorker implements RegressionWorker {
    private final String id;
    private final String name;
    private final String subsystem;
    private final String description;
    private final AtomicBoolean enabled = new AtomicBoolean(true);
    private final LongAdder events = new LongAdder();
    private final AtomicLong pressureBits = new AtomicLong(Double.doubleToRawLongBits(0.0d));

    protected AbstractRegressionWorker(String id, String name, String subsystem, String description) {
        this.id = id;
        this.name = name;
        this.subsystem = subsystem;
        this.description = description;
    }

    @Override
    public String id() {
        return id;
    }

    @Override
    public String name() {
        return name;
    }

    @Override
    public String subsystem() {
        return subsystem;
    }

    @Override
    public String description() {
        return description;
    }

    @Override
    public boolean enabled() {
        return enabled.get();
    }

    @Override
    public void setEnabled(boolean enabled) {
        this.enabled.set(enabled);
    }

    protected void record(double pressure) {
        events.increment();
        pressureBits.set(Double.doubleToRawLongBits(Math.max(0.0d, Math.min(1.0d, pressure))));
    }

    protected double jitter(double base, double width) {
        return Math.max(0.0d, Math.min(1.0d, base + ThreadLocalRandom.current().nextDouble(-width, width)));
    }

    @Override
    public RegressionSignal signal() {
        double pressure = Double.longBitsToDouble(pressureBits.get());
        String severity = pressure > 0.78 ? "CRITICAL" : pressure > 0.55 ? "WARN" : "INFO";
        if (!enabled()) {
            severity = "IDLE";
            pressure = 0.0d;
        }
        return new RegressionSignal(id, name, subsystem, severity, enabled(), pressure, events.sum(), description);
    }

    protected static String slug(String value) {
        return value.toLowerCase(Locale.ROOT).replace(' ', '-');
    }
}
