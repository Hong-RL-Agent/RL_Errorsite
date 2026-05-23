package com.fuzzing.agent.service;

import com.fuzzing.agent.domain.Account;
import com.fuzzing.agent.domain.User;
import com.fuzzing.agent.repository.AccountRepository;
import com.fuzzing.agent.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;

    @Transactional
    public User createUser(String username, String email, String nickname) {
        User user = User.builder()
            .username(username)
            .email(email)
            .nickname(nickname)
            .build();
        User savedUser = userRepository.save(user);

        Account account = Account.builder()
            .user(savedUser)
            .balance(BigDecimal.valueOf(100000))
            .points(BigDecimal.valueOf(5000))
            .build();
        accountRepository.save(account);

        return savedUser;
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<Account> getAccountByUser(User user) {
        return accountRepository.findByUser(user);
    }
}
