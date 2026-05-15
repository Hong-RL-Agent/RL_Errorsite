package ai.trans.policylab.config;

import ai.trans.policylab.websocket.PolicyWebSocketHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    private final PolicyWebSocketHandler policyWebSocketHandler;
    private final String allowedOrigin;

    public WebSocketConfig(PolicyWebSocketHandler policyWebSocketHandler,
                           @Value("${ai-trans.allowed-origin}") String allowedOrigin) {
        this.policyWebSocketHandler = policyWebSocketHandler;
        this.allowedOrigin = allowedOrigin;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(policyWebSocketHandler, "/ws/policy")
                .setAllowedOrigins(allowedOrigin, "http://localhost:9087");
    }
}

