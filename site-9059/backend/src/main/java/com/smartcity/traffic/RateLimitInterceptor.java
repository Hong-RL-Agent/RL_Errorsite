package com.smartcity.traffic;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private final Map<String, AtomicInteger> requestCounts = new ConcurrentHashMap<>();
    private final int MAX_REQUESTS = 50;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String clientIp = request.getRemoteAddr();
        requestCounts.putIfAbsent(clientIp, new AtomicInteger(0));
        
        int currentCount = requestCounts.get(clientIp).incrementAndGet();
        
        // Defect 1: Resource Allocation Limit Exceeded
        if (currentCount > MAX_REQUESTS) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.getWriter().write("429 Too Many Requests: Resource Quota Exceeded for IP " + clientIp);
            return false;
        }
        
        return true;
    }
}
