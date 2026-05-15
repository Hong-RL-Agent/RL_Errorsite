package guide.michelin.security.airecipe.controller;

import guide.michelin.security.airecipe.model.RecipeRequest;
import guide.michelin.security.airecipe.model.RecipeResponse;
import guide.michelin.security.airecipe.service.RecipeService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recipes")
public class RecipeController {
    private final RecipeService recipeService;

    public RecipeController(RecipeService recipeService) {
        this.recipeService = recipeService;
    }

    @PostMapping("/generate")
    public RecipeResponse generate(@Valid @RequestBody RecipeRequest request) {
        return recipeService.generate(request);
    }
}

