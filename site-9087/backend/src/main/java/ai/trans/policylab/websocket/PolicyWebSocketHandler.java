package ai.trans.policylab.websocket;

import ai.trans.policylab.service.PolicyLogService;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
public class PolicyWebSocketHandler extends TextWebSocketHandler {
    private final PolicyLogService policyLogService;

    public PolicyWebSocketHandler(PolicyLogService policyLogService) {
        this.policyLogService = policyLogService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        policyLogService.record("websocket", "Connection opened then intentionally closed for reconnect storm simulation");
        session.sendMessage(new TextMessage("{\"status\":\"connected\",\"policy\":\"close-immediately\"}"));
        session.close(CloseStatus.POLICY_VIOLATION);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        policyLogService.record("websocket", "Connection closed with " + status);
    }
}

