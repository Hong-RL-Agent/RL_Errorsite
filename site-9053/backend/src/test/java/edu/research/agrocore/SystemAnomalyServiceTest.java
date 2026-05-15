package edu.research.agrocore;

import edu.research.agrocore.service.SystemAnomalyService;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SystemAnomalyServiceTest {
    @Test
    void exposesElevenRegressionChannels() {
        SystemAnomalyService service = new SystemAnomalyService(true);

        assertThat(service.anomalies()).hasSize(11);
        assertThat(service.telemetry().anomalies()).hasSize(11);
    }
}
