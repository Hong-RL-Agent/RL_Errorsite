package com.jaws.neolit.config;

// 빠져있던 필수 import 구문들 추가!
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // CSRF 비활성화 (보안 취약점)
            .cors(cors -> cors.configurationSource(request -> {
                var corsConfig = new CorsConfiguration();
                // 의도적 결함: CORS 와일드카드 허용으로 타 사이트에서 요청 가능 (Index: 9045-Network-1)
                corsConfig.setAllowedOrigins(List.of("*"));
                corsConfig.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
                corsConfig.setAllowedHeaders(List.of("*"));
                return corsConfig;
            }))
            .authorizeHttpRequests(auth -> auth
                // 의도적 결함: 모든 엔드포인트 무단 접근 허용 (Index: 9045-Auth-1)
                .anyRequest().permitAll()
            );
        return http.build();
    }
}