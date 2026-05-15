package guard.ocean.stream;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArraySet;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
public class SensorStreamHandler extends TextWebSocketHandler {
    private final CopyOnWriteArraySet<WebSocketSession> sessions = new CopyOnWriteArraySet<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sessions.add(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, org.springframework.web.socket.CloseStatus status) {
        sessions.remove(session);
    }

    @Scheduled(fixedRate = 2500)
    public void publish() throws IOException {
        String payload = """
            {"timestamp":"%s","node":"PELAGIC-17","vessel":"OGV Asterion","microplastics":%d,"hydrocarbon":%.2f,"threat":"%s"}
            """.formatted(Instant.now(), 80 + (int) (Math.random() * 130), 0.8 + Math.random() * 4.4,
            Math.random() > 0.72 ? "CRIMSON" : "STABLE").trim();
        for (WebSocketSession session : sessions) {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage(payload));
            }
        }
    }
}
