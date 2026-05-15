package hotel.orbit.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.time.Instant;
import java.util.Map;

@Controller
public class MonitorSocketController {
    @MessageMapping("/pulse")
    @SendTo("/topic/antigravity")
    public Map<String, Object> pulse(Map<String, Object> message) {
        return Map.of(
                "timestamp", Instant.now().toString(),
                "room", "AG-9047",
                "origin", message.getOrDefault("origin", "unknown"),
                "stabilizer", "ONLINE"
        );
    }
}
