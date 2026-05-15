package lab.cyber.web;

import lab.cyber.model.DefensePosture;
import lab.cyber.model.StatusResponse;
import lab.cyber.service.CyberLabService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@CrossOrigin
@RestController
@RequestMapping("/api")
public class CyberLabController {
    private final CyberLabService service;

    public CyberLabController(CyberLabService service) {
        this.service = service;
    }

    @GetMapping("/status")
    public StatusResponse status() {
        return service.status();
    }

    @PostMapping("/defense")
    public DefensePosture defense(@RequestBody DefensePosture posture) {
        return service.updateDefense(posture);
    }

    @PostMapping("/scenarios/{id}/trigger")
    public ResponseEntity<Object> trigger(@PathVariable String id) {
        Object body = service.trigger(id);
        if (body instanceof Map<?, ?> map && map.containsKey("error")) {
            return ResponseEntity.badRequest().body(body);
        }
        return ResponseEntity.ok(body);
    }

    @GetMapping("/dependency/probe")
    public Map<String, Object> dependencyProbe() {
        return service.dependencyProbe();
    }
}
