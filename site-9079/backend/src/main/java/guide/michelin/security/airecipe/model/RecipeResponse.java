package guide.michelin.security.airecipe.model;

import java.time.Instant;
import java.util.List;

public record RecipeResponse(
        String recipeId,
        String title,
        int riskScore,
        List<String> steps,
        List<SecurityEvent> securityEvents,
        Instant generatedAt
) {
}

