package ai.trans.policylab.config;

import ai.trans.policylab.service.PolicyLogService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SecurityHeadersFilter extends OncePerRequestFilter {
    private final PolicyLogService policyLogService;

    public SecurityHeadersFilter(PolicyLogService policyLogService) {
        this.policyLogService = policyLogService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        response.setHeader("Content-Security-Policy",
                "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' ws://localhost:9087 http://localhost:9087; img-src 'self' data:; font-src 'self' data:;");
        response.setHeader("Referrer-Policy", "no-referrer");
        response.setHeader("Permissions-Policy", "geolocation=(self), microphone=(self), clipboard-write=(self)");
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("X-AI-TRANS-POLICY", "strict-csp-cors-training");

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            policyLogService.record("cors", "Preflight OPTIONS observed for " + request.getRequestURI());
        }

        filterChain.doFilter(request, response);
    }
}

