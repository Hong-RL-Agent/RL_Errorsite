package guide.michelin.security.airecipe;

import guide.michelin.security.airecipe.model.RecipeRequest;
import guide.michelin.security.airecipe.service.VirtualMemoryEngine;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class VirtualMemoryEngineTest {
    @Test
    void detectsAllTrainingPatternsInSeed() {
        VirtualMemoryEngine engine = new VirtualMemoryEngine();
        var events = engine.analyze(new RecipeRequest(
                "admin backdoor :: type-confusion use-after-free heap-spray rop gadget long-name-trigger-for-buffer-overflow-detection",
                250000000,
                List.of("swap-file", "schema-mismatch", "AAAA-AAAA-AAAA"),
                "credential approval %x %n"
        ));

        assertThat(events).hasSize(11);
    }
}

