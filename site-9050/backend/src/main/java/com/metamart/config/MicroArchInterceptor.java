package com.metamart.config;

import com.metamart.sim.MicroArchSimService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class MicroArchInterceptor implements HandlerInterceptor {
    private final MicroArchSimService simService;

    public MicroArchInterceptor(MicroArchSimService simService) {
        this.simService = simService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        simService.recordRequest();
        simService.simulateSessionColdStart(request.getSession().isNew());
        simService.simulateCoreMigrationPenalty();
        simService.simulateDramRefreshJitter();
        return true;
    }
}
