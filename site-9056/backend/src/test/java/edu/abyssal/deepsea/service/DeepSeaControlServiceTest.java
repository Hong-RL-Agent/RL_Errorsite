package edu.abyssal.deepsea.service;

import edu.abyssal.deepsea.config.DeepSeaProperties;
import edu.abyssal.deepsea.model.CoreStatus;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class DeepSeaControlServiceTest {
    @Test
    void exposesAllElevenFaults() {
        DeepSeaControlService service = new DeepSeaControlService(new DeepSeaProperties(0.75, 32, 70));

        CoreStatus status = service.currentStatus();

        assertThat(status.faults()).hasSize(11);
        assertThat(status.depthSeries()).hasSize(72);
        assertThat(status.terrainGrid()).hasSize(144);
    }
}
