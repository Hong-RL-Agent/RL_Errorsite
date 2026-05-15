package com.aieducation.config;

import com.aieducation.ws.TrainingChatHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    private final TrainingChatHandler trainingChatHandler;

    public WebSocketConfig(TrainingChatHandler trainingChatHandler) {
        this.trainingChatHandler = trainingChatHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(trainingChatHandler, "/ws/classroom")
                .setAllowedOrigins("http://localhost:9093", "http://127.0.0.1:9093");
    }
}
