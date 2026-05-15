package com.eyescan;

import static org.assertj.core.api.Assertions.assertThat;

import com.eyescan.service.FaultScenarioService;
import org.junit.jupiter.api.Test;

class EyeScanApplicationTests {
    @Test
    void exposesElevenFaultScenarios() {
        FaultScenarioService service = new FaultScenarioService();
        assertThat(service.scenarios()).hasSize(11);
    }
}

