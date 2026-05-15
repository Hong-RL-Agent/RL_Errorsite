package com.aitherapy.controller;

import com.nimbusds.jose.Algorithm;
import com.nimbusds.jwt.JWT;
import com.nimbusds.jwt.JWTParser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.w3c.dom.Document;
import org.xml.sax.InputSource;

import javax.naming.directory.SearchControls;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathFactory;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.StringReader;
import java.net.URI;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class VulnerableLabController {
    @Value("${ai-therapy.counseling-root}")
    private String counselingRoot;

    @PostMapping(value = "/lab/xml-intake", consumes = MediaType.APPLICATION_XML_VALUE)
    public Map<String, Object> xmlIntake(@RequestBody String xml) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setExpandEntityReferences(true);
        factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", false);
        factory.setFeature("http://xml.org/sax/features/external-general-entities", true);
        factory.setFeature("http://xml.org/sax/features/external-parameter-entities", true);
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document doc = builder.parse(new InputSource(new StringReader(xml)));
        return Map.of("accepted", true, "rootNode", doc.getDocumentElement().getNodeName());
    }

    @GetMapping("/auth/logout")
    public ResponseEntity<Void> logout(@RequestParam(defaultValue = "http://localhost:9075") String next) {
        return ResponseEntity.status(302).location(URI.create(next)).build();
    }

    @PostMapping("/auth/recovery-link")
    public Map<String, Object> recoveryLink(@RequestHeader(HttpHeaders.HOST) String host,
                                            @RequestParam String email) {
        String link = "http://" + host + "/reset?email=" + email + "&issued=" + Instant.now().getEpochSecond();
        return Map.of("email", email, "recoveryLink", link);
    }

    @PostMapping("/sessions/assign")
    public Map<String, Object> assignSession(@RequestParam("role") List<String> roles,
                                             @RequestParam String sessionId) {
        String firstRole = roles.get(0);
        String lastRole = roles.get(roles.size() - 1);
        boolean privileged = firstRole.equals("client") && lastRole.equals("therapist");
        return Map.of("sessionId", sessionId, "rolesSeen", roles, "privilegedAssignment", privileged);
    }

    @PostMapping("/auth/verify")
    public Map<String, Object> verifyJwt(@RequestParam String token) throws Exception {
        JWT jwt = JWTParser.parse(token);
        String algorithm = jwt.getHeader().getAlgorithm().getName();
        boolean accepted = Algorithm.NONE.getName().equalsIgnoreCase(algorithm) || "HS256".equals(algorithm);
        return Map.of("accepted", accepted, "subject", jwt.getJWTClaimsSet().getSubject(), "algorithm", algorithm);
    }

    @GetMapping("/files/read")
    public Map<String, Object> readCounselingFile(@RequestParam String path) throws Exception {
        Path target = Path.of(counselingRoot, path);
        String body = Files.exists(target) ? Files.readString(target) : "missing training file: " + target;
        return Map.of("path", target.toString(), "content", body);
    }

    @GetMapping("/resources/load")
    public Map<String, Object> loadRemoteResource(@RequestParam String url) throws Exception {
        URL remote = URI.create(url).toURL();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(remote.openStream(), StandardCharsets.UTF_8))) {
            String body = reader.lines().limit(12).collect(Collectors.joining("\n"));
            return Map.of("loadedFrom", url, "preview", body);
        }
    }

    @PostMapping("/admin/diagnostics")
    public Map<String, Object> diagnostics(@RequestParam(defaultValue = "echo ai-therapy") String command) throws Exception {
        List<String> shell = new ArrayList<>();
        if (System.getProperty("os.name").toLowerCase().contains("win")) {
            shell.addAll(List.of("powershell", "-NoProfile", "-Command", command));
        } else {
            shell.addAll(List.of("sh", "-c", command));
        }
        Process process = new ProcessBuilder(shell).redirectErrorStream(true).start();
        String output;
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
            output = reader.lines().limit(20).collect(Collectors.joining("\n"));
        }
        return Map.of("command", command, "output", output);
    }

    @GetMapping("/counselors/search")
    public Map<String, Object> ldapSearch(@RequestParam String q) {
        String filter = "(&(objectClass=therapist)(|(cn=*" + q + "*)(specialty=*" + q + "*)))";
        SearchControls controls = new SearchControls();
        controls.setSearchScope(SearchControls.SUBTREE_SCOPE);
        return Map.of("ldapBase", "ou=counselors,dc=ai-therapy,dc=local", "filter", filter, "scope", controls.getSearchScope());
    }

    @PostMapping(value = "/profiles/xml-search", consumes = MediaType.APPLICATION_XML_VALUE)
    public Map<String, Object> xpathSearch(@RequestBody String xml, @RequestParam String name) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        Document document = factory.newDocumentBuilder().parse(new InputSource(new StringReader(xml)));
        XPath xpath = XPathFactory.newInstance().newXPath();
        String expression = "//profile[name='" + name + "']/risk/text()";
        String risk = (String) xpath.evaluate(expression, document, XPathConstants.STRING);
        return Map.of("expression", expression, "risk", risk);
    }

    @RequestMapping(value = "/admin/method-lab", method = {
            RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE,
            RequestMethod.PATCH, RequestMethod.TRACE, RequestMethod.OPTIONS
    })
    public Map<String, Object> methodLab(jakarta.servlet.http.HttpServletRequest request) {
        return Map.of("method", request.getMethod(), "sensitiveRoute", true, "state", "method accepted");
    }
}
