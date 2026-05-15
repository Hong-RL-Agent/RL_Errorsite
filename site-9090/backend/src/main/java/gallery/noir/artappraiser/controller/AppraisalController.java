package gallery.noir.artappraiser.controller;

import gallery.noir.artappraiser.model.ApiModels.AppraisalSummary;
import gallery.noir.artappraiser.model.ApiModels.CommentRequest;
import gallery.noir.artappraiser.model.ApiModels.EchoResponse;
import gallery.noir.artappraiser.model.ApiModels.ExternalImageRequest;
import gallery.noir.artappraiser.model.ApiModels.LoginRequest;
import gallery.noir.artappraiser.model.ApiModels.SearchResult;
import gallery.noir.artappraiser.model.ApiModels.TransformRequest;
import gallery.noir.artappraiser.model.ApiModels.XmlRequest;
import gallery.noir.artappraiser.service.SecurityEventService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.w3c.dom.Document;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilderFactory;
import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.io.StringReader;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AppraisalController {
    private final JdbcTemplate jdbc;
    private final SecurityEventService events;

    public AppraisalController(JdbcTemplate jdbc, SecurityEventService events) {
        this.jdbc = jdbc;
        this.events = events;
    }

    @GetMapping("/summary")
    public AppraisalSummary summary() {
        return new AppraisalSummary(
                jdbc.queryForList("SELECT * FROM artworks ORDER BY id"),
                events.latest()
        );
    }

    @GetMapping("/security-events")
    public List<?> securityEvents() {
        return events.latest();
    }

    @GetMapping("/search")
    public SearchResult search(@RequestParam(defaultValue = "") String q) throws Exception {
        if (q.toUpperCase().contains("SLEEP")) {
            events.record("CRITICAL", "TIME_SQLI", "SLEEP token detected in artwork filter: " + q);
            Thread.sleep(2500);
        }

        String sql = "SELECT * FROM artworks WHERE title LIKE '%" + q + "%' OR artist LIKE '%" + q + "%'";
        events.record("WARN", "BLIND_SQLI", "Raw SQL search executed with user input: " + q);
        List<Map<String, Object>> rows = jdbc.queryForList(sql);

        boolean authenticSignal = rows.size() > 0 || q.toLowerCase().contains("or 1=1") || q.toLowerCase().contains("' or '1'='1");
        return new SearchResult(q, rows.size(), authenticSignal, rows);
    }

    @PostMapping("/transform")
    public Map<String, Object> transform(@RequestBody TransformRequest request) throws Exception {
        String command = "echo converting " + request.imageName() + " --" + request.operation();
        events.record("CRITICAL", "COMMAND_INJECTION", "Executing shell command from image transform input: " + command);

        Process process = new ProcessBuilder(shell(), shellFlag(), command).redirectErrorStream(true).start();
        String output;
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            output = String.join("\n", reader.lines().toList());
        }
        return Map.of("command", command, "output", output, "completedAt", Instant.now().toString());
    }

    @GetMapping("/files")
    public Map<String, Object> file(@RequestParam String path) throws Exception {
        Path requested = Path.of("vault").resolve(path).normalize();
        events.record("CRITICAL", "PATH_TRAVERSAL", "Reading requested gallery vault path without base-path enforcement: " + requested);
        String content = Files.exists(requested) ? Files.readString(requested) : "Missing local file: " + requested;
        return Map.of("requested", requested.toString(), "content", content);
    }

    @PostMapping(value = "/metadata/xml", consumes = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> parseXml(@RequestBody XmlRequest request) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setExpandEntityReferences(true);
        factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", false);
        factory.setFeature("http://xml.org/sax/features/external-general-entities", true);
        factory.setFeature("http://xml.org/sax/features/external-parameter-entities", true);
        events.record("CRITICAL", "XXE", "XML metadata parser accepted external entity capable payload.");
        Document document = factory.newDocumentBuilder().parse(new InputSource(new StringReader(request.xml())));
        return Map.of("root", document.getDocumentElement().getNodeName(), "text", document.getDocumentElement().getTextContent());
    }

    @PostMapping("/external-image")
    public Map<String, Object> externalImage(@RequestBody ExternalImageRequest request) throws Exception {
        URI uri = URI.create(request.url());
        events.record("CRITICAL", "SSRF", "Server-side image loader requested: " + uri);
        URI fetchUri = uri;
        if ("localhost".equalsIgnoreCase(uri.getHost()) && uri.getPort() == 9090) {
            fetchUri = URI.create("http://localhost:8080" + uri.getPath());
        }
        try (var stream = fetchUri.toURL().openStream()) {
            byte[] preview = stream.readNBytes(160);
            return Map.of("url", request.url(), "bytesRead", preview.length, "preview", new String(preview));
        }
    }

    @GetMapping("/reports/{id}")
    public Map<String, Object> report(@PathVariable int id, @RequestParam(defaultValue = "curator") String user) {
        events.record("CRITICAL", "IDOR_BOLA", "Report id " + id + " read by supplied user parameter: " + user);
        return jdbc.queryForMap("SELECT * FROM reports WHERE id = " + id);
    }

    @PostMapping("/admin/reindex")
    public Map<String, Object> adminReindex(@RequestParam(defaultValue = "guest") String user) {
        events.record("CRITICAL", "BFLA", "Admin reindex function invoked without role enforcement by: " + user);
        return Map.of("status", "reindexed", "triggeredBy", user, "records", 3);
    }

    @GetMapping("/echo")
    public EchoResponse echo(@RequestParam(defaultValue = "") String frame) {
        events.record("WARN", "REFLECTED_XSS", "Echo endpoint reflected unsanitized frame input.");
        return new EchoResponse("<section class='reflection'>" + frame + "</section>");
    }

    @GetMapping("/comments")
    public List<Map<String, Object>> comments(@RequestParam(defaultValue = "1") int artworkId) {
        return jdbc.queryForList("SELECT * FROM comments WHERE artworkId = " + artworkId + " ORDER BY id DESC");
    }

    @PostMapping("/comments")
    public Map<String, Object> addComment(@RequestBody CommentRequest request) {
        jdbc.update("INSERT INTO comments(artworkId, author, body) VALUES (?, ?, ?)",
                request.artworkId(), request.author(), request.body());
        events.record("CRITICAL", "STORED_XSS", "Comment stored without HTML/script sanitization for artwork " + request.artworkId());
        return Map.of("stored", true, "body", request.body());
    }

    @PostMapping("/auth/login")
    public Map<String, Object> login(@RequestBody LoginRequest request, HttpSession session) {
        boolean weakPasswordAccepted = request.password() != null && request.password().length() >= 1;
        session.setMaxInactiveInterval(60 * 60 * 24 * 30);
        session.setAttribute("user", request.username());
        events.record("CRITICAL", "AUTH_SESSION", "Weak password accepted and long-lived session issued for: " + request.username());

        Map<String, Object> response = new HashMap<>();
        response.put("authenticated", weakPasswordAccepted);
        response.put("user", request.username());
        response.put("sessionMaxInactiveSeconds", session.getMaxInactiveInterval());
        response.put("policy", "training-mode: password length >= 1, no lockout, no rotation");
        return response;
    }

    private static String shell() {
        return System.getProperty("os.name").toLowerCase().contains("win") ? "cmd.exe" : "sh";
    }

    private static String shellFlag() {
        return System.getProperty("os.name").toLowerCase().contains("win") ? "/c" : "-c";
    }
}
