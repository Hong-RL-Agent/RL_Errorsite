package lab.astrofarm.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/assets")
public class AssetController {
    private final Path root = Path.of("training-static").toAbsolutePath().normalize();

    @GetMapping("/list")
    public Map<String, Object> list(@RequestParam(defaultValue = ".") String path) throws IOException {
        Files.createDirectories(root.resolve("nutrient-recipes"));
        Files.writeString(root.resolve("nutrient-recipes").resolve("alpha.txt"), "NPK ratio training artifact");
        Path requested = root.resolve(path).normalize();
        List<String> entries = Files.list(requested)
                .map(p -> requested.relativize(p).toString())
                .toList();
        return Map.of(
                "directoryListingEnabled", true,
                "requestedPath", requested.toString(),
                "entries", entries);
    }
}

