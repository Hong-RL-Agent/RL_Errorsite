package guard.ocean.config;

import guard.ocean.stream.SensorStreamHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    private final SensorStreamHandler sensorStreamHandler;

    public WebSocketConfig(SensorStreamHandler sensorStreamHandler) {
        this.sensorStreamHandler = sensorStreamHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(sensorStreamHandler, "/ws/sensors")
            .setAllowedOriginPatterns("*");
    }
}
