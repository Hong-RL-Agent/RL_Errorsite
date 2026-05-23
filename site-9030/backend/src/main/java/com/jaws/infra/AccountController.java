package com.jaws.infra;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/account")
public class AccountController {

    // [핵심 오류 포인트] ThreadLocal 사용 후 clear하지 않아 이전 데이터가 잔류함
    private static final ThreadLocal<String> userContext = new ThreadLocal<>();

    @GetMapping("/profile")
    public Map<String, String> getProfile(@RequestParam(required = false) String name) {
        // name이 전달되면 현재 스레드에 저장 (로그인 시뮬레이션)
        if (name != null && !name.isEmpty()) {
            userContext.set(name);
        }

        // 현재 스레드에 저장된 이름을 가져옴
        String currentUser = userContext.get();
        
        // 만약 유저 정보가 없으면 기본값 설정
        if (currentUser == null) {
            currentUser = "Guest_User";
        }

        // [주의] 여기서 userContext.remove()를 호출하지 않음으로써 다음 요청에서 데이터가 유출됨
        return Map.of(
            "username", currentUser,
            "accountNumber", "110-456-789012",
            "balance", "₩ 12,450,000",
            "lastLogin", new Date().toString()
        );
    }

    @PostMapping("/logout")
    public Map<String, String> logout() {
        userContext.remove(); // 여기서는 지워주지만, 브라우저가 그냥 닫히면? (유출 발생)
        return Map.of("message", "Logged out safely");
    }
}