package com.aieducation.ws;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.time.Instant;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TrainingChatHandler extends TextWebSocketHandler {
    private final Set<WebSocketSession> sessions = ConcurrentHashMap.newKeySet();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);
        session.sendMessage(new TextMessage("""
                {"type":"system","scenario":"WS-11","message":"권한 검증 없이 실시간 강의 채널에 연결되었습니다.","timestamp":"%s"}
                """.formatted(Instant.now())));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload().replace("\"", "\\\"");
        String broadcast = """
                {"type":"chat","scenario":"WS-11","sender":"live-room","message":"%s","timestamp":"%s"}
                """.formatted(payload, Instant.now());
        for (WebSocketSession active : sessions) {
            if (active.isOpen()) {
                active.sendMessage(new TextMessage(broadcast));
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session);
    }
}
