package com.jaws.neolit.config;

import org.springframework.stereotype.Component;

@Component
public class ThreadLocalContext {
    private static final ThreadLocal<String> currentUser = new ThreadLocal<>();

    public void setUser(String username) {
        currentUser.set(username);
    }

    public String getUser() {
        return currentUser.get();
    }

    // 의도적 결함: .remove()를 호출하지 않아 스레드 재사용 시 이전 사용자 정보가 유출됨
    public void clear() {
        // currentUser.remove(); // 고의로 주석 처리함
    }
}