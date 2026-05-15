package hotel.orbit.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {
    private final Path uploadPath;

    public UploadController(@Value("${orbit.uploads}") String uploads) {
        this.uploadPath = Path.of(uploads);
    }

    @PostMapping(value = "/identity", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Object> uploadIdentity(@RequestParam("file") MultipartFile file) throws IOException {
        String originalName = file.getOriginalFilename() == null ? "unknown" : file.getOriginalFilename();

        // J.A.W.S intentional defect #2:
        // Only the final suffix is checked. Double extensions such as passport.php.jpg pass.
        if (!(originalName.endsWith(".jpg") || originalName.endsWith(".jpeg") || originalName.endsWith(".png")
                || originalName.endsWith(".JPG") || originalName.endsWith(".JPEG") || originalName.endsWith(".PNG"))) {
            throw new IllegalArgumentException("Only orbital ID image files are accepted");
        }

        Files.createDirectories(uploadPath);
        Path destination = uploadPath.resolve(originalName);
        file.transferTo(destination);

        return Map.of("storedAs", destination.toString(), "size", file.getSize());
    }
}
