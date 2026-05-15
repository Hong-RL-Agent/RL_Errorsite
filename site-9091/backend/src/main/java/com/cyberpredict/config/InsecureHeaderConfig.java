package com.cyberpredict.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Configuration
public class InsecureHeaderConfig {
    @Bean
    public OncePerRequestFilter intentionallyMissingSecurityHeadersFilter() {
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
                    throws ServletException, IOException {
                response.setHeader("X-CYBER-PREDICT-Training", "insecure-lab");
                response.setHeader("Server", "CYBER-PREDICT-Debug/0.1");
                filterChain.doFilter(request, response);
            }
        };
    }
}
