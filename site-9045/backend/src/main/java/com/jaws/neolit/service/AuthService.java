package com.jaws.neolit.service;

import com.jaws.neolit.config.ThreadLocalContext;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final ThreadLocalContext context;

    public AuthService(ThreadLocalContext context) {
        this.context = context;
    }

    public String loginAndSetContext(String email) {
        // 인증 절차 없이 무조건 로그인 성공 처리 (취약점)
        context.setUser(email);
        return "Logged in as: " + email;
    }

    public String getCurrentUserFromContext() {
        // ThreadLocal에서 값을 꺼내오지만 clear가 안되어 이전 정보가 섞일 수 있음
        String user = context.getUser();
        return user != null ? user : "Anonymous";
    }
}