package guide.michelin.security.airecipe.service;

import guide.michelin.security.airecipe.model.RecipeRequest;
import guide.michelin.security.airecipe.model.RecipeResponse;
import guide.michelin.security.airecipe.model.SecurityEvent;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class RecipeService {
    private final VirtualMemoryEngine memoryEngine;

    public RecipeService(VirtualMemoryEngine memoryEngine) {
        this.memoryEngine = memoryEngine;
    }

    public RecipeResponse generate(RecipeRequest request) {
        List<SecurityEvent> events = memoryEngine.analyze(request);
        int riskScore = Math.min(100, events.size() * 9 + events.stream()
                .mapToInt(event -> switch (event.severity()) {
                    case "CRITICAL" -> 12;
                    case "HIGH" -> 8;
                    case "MEDIUM" -> 5;
                    default -> 2;
                })
                .sum());

        List<String> ingredients = request.ingredients() == null ? List.of("black garlic", "charred leek", "herb oil") : request.ingredients();
        List<String> steps = List.of(
                "Calibrate flavor vectors for " + request.concept() + ".",
                "Bind " + String.join(", ", ingredients) + " into a low-temperature emulsion.",
                "Run virtual memory inspection before publishing the plate.",
                "Finish with burnt-orange heat, deep-green herb signal, and a clean audit trail."
        );

        return new RecipeResponse(
                "AIR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                "Noir Tasting Sequence: " + request.concept(),
                riskScore,
                steps,
                events,
                Instant.now()
        );
    }
}

