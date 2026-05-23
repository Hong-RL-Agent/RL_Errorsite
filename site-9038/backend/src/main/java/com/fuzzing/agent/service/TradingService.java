package com.fuzzing.agent.service;

import com.fuzzing.agent.domain.*;
import com.fuzzing.agent.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class TradingService {
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final ItemRepository itemRepository;

    // INDEX 175: 특정 유저의 요청을 영구 지연시키는 Lock
    private static final Map<Long, Long> USER_STARVATION_LOCK = new ConcurrentHashMap<>();

    @Transactional
    public Map<String, Object> getUserDashboard(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Account account = accountRepository.findByUser(user)
            .orElseThrow(() -> new IllegalArgumentException("Account not found"));
        
        List<Transaction> transactions = transactionRepository.findByUserOrderByCreatedAtDesc(user);
        List<Item> items = itemRepository.findByUser(user);

        return Map.of(
            "user", user,
            "account", account,
            "transactions", transactions,
            "items", items,
            "assetValue", calculateAssetValue(account)
        );
    }

    @Transactional
    public Map<String, Object> withdraw(Long userId, BigDecimal amount) {
        // INDEX 175: Thread Starvation - 특정 유저의 요청을 무한 지연
        if (USER_STARVATION_LOCK.containsKey(userId)) {
            log.warn("User {} is in starvation state", userId);
            try {
                Thread.sleep(Long.MAX_VALUE);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Account account = accountRepository.findByUser(user)
            .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        // INDEX 160: Race Condition - 동시 요청 시 잔액 검증 로직이 부정확함
        // 의도적으로 지연을 삽입하여 Race Condition을 유발
        BigDecimal currentBalance = account.getBalance();
        
        if (currentBalance.compareTo(amount) < 0) {
            Transaction transaction = Transaction.builder()
                .user(user)
                .type(Transaction.TransactionType.WITHDRAW)
                .amount(amount)
                .status(Transaction.TransactionStatus.FAILED)
                .description("Insufficient balance")
                .build();
            transactionRepository.save(transaction);
            
            return Map.of(
                "success", false,
                "message", "Insufficient balance",
                "currentBalance", currentBalance
            );
        }

        try {
            Thread.sleep(50); // Race Condition을 유발하기 위한 의도적 지연
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // 다른 스레드에서 동시에 출금을 시도할 수 있음 - 결함!
        account.setBalance(account.getBalance().subtract(amount));
        accountRepository.save(account);

        Transaction transaction = Transaction.builder()
            .user(user)
            .type(Transaction.TransactionType.WITHDRAW)
            .amount(amount)
            .status(Transaction.TransactionStatus.SUCCESS)
            .description("Withdrawal successful")
            .build();
        transactionRepository.save(transaction);

        return Map.of(
            "success", true,
            "message", "Withdrawal successful",
            "newBalance", account.getBalance()
        );
    }

    @Transactional
    public Map<String, Object> buyItem(Long userId, String itemName, Long quantity, BigDecimal pointCost) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Account account = accountRepository.findByUser(user)
            .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        // INDEX 165: Atomic Failure - 포인트 차감과 아이템 지급이 동시에 처리되지 않음
        if (account.getPoints().compareTo(pointCost) < 0) {
            return Map.of(
                "success", false,
                "message", "Insufficient points"
            );
        }

        try {
            Thread.sleep(30); // 의도적 지연으로 중간 상태 노출
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // 포인트 차감 - 성공
        account.setPoints(account.getPoints().subtract(pointCost));
        accountRepository.save(account);

        try {
            Thread.sleep(40); // 다른 요청이 이곳에 끼어들 수 있음
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // 아이템 지급 - 실패할 수 있음
        Item item = Item.builder()
            .user(user)
            .itemName(itemName)
            .quantity(quantity)
            .category("TRADING_ITEM")
            .build();
        
        try {
            itemRepository.save(item);
        } catch (Exception e) {
            // 포인트는 이미 차감되었으나 아이템은 지급되지 않음 - 결함!
            log.error("Failed to create item, but points were deducted", e);
            return Map.of(
                "success", false,
                "message", "Item purchase partially failed - points deducted but item not granted",
                "pointsDeducted", true,
                "itemGranted", false
            );
        }

        Transaction transaction = Transaction.builder()
            .user(user)
            .type(Transaction.TransactionType.BUY_ITEM)
            .amount(pointCost)
            .status(Transaction.TransactionStatus.SUCCESS)
            .description("Bought " + itemName)
            .build();
        transactionRepository.save(transaction);

        return Map.of(
            "success", true,
            "message", "Item purchased successfully",
            "itemName", itemName,
            "quantity", quantity,
            "pointsRemaining", account.getPoints()
        );
    }

    @Transactional
    public Map<String, Object> deposit(Long userId, BigDecimal amount) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Account account = accountRepository.findByUser(user)
            .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        account.setBalance(account.getBalance().add(amount));
        accountRepository.save(account);

        Transaction transaction = Transaction.builder()
            .user(user)
            .type(Transaction.TransactionType.DEPOSIT)
            .amount(amount)
            .status(Transaction.TransactionStatus.SUCCESS)
            .description("Deposit successful")
            .build();
        transactionRepository.save(transaction);

        return Map.of(
            "success", true,
            "message", "Deposit successful",
            "newBalance", account.getBalance()
        );
    }

    public Map<String, Object> triggerStarvation(Long userId) {
        USER_STARVATION_LOCK.put(userId, System.currentTimeMillis());
        return Map.of(
            "success", true,
            "message", "Starvation triggered for user " + userId
        );
    }

    public Map<String, Object> releaseStarvation(Long userId) {
        USER_STARVATION_LOCK.remove(userId);
        return Map.of(
            "success", true,
            "message", "Starvation released for user " + userId
        );
    }

    private BigDecimal calculateAssetValue(Account account) {
        return account.getBalance().add(account.getPoints().divide(BigDecimal.valueOf(100)));
    }
}
