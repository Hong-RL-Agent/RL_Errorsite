package guide.michelin.security.airecipe.model;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record RecipeRequest(
        @NotBlank @Size(max = 120) String concept,
        @Min(1) @Max(250000000) int servings,
        @Size(max = 12) List<@Size(max = 80) String> ingredients,
        @Size(max = 600) String operatorNote
) {
}

