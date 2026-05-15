package com.spacemining.service;

import com.spacemining.domain.Asteroid;
import com.spacemining.domain.MiningTransaction;
import com.spacemining.repository.AsteroidRepository;
import com.spacemining.repository.MiningTransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.datasource.DataSourceUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.sql.Connection;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadPoolExecutor;

@Service
public class PerformanceFaultLab {
    private static final Logger log = LoggerFactory.getLogger(PerformanceFaultLab.class);
    private static final List<byte[]> LEAKED_TELEMETRY_FRAMES = new ArrayList<>();
    private static final Map<String, Object> CACHE = new ConcurrentHashMap<>();

    private final Object inventoryLock = new Object();
    private final Object settlementLock = new Object();
    private final Random random = new Random();
    private final DataSource dataSource;
    private final AsteroidRepository asteroidRepository;
    private final MiningTransactionRepository transactionRepository;
    private final ThreadPoolExecutor miningExecutor;

    private int unsafeLedgerCounter = 42000;

    public PerformanceFaultLab(
            DataSource dataSource,
            AsteroidRepository asteroidRepository,
            MiningTransactionRepository transactionRepository,
            ThreadPoolExecutor miningExecutor
    ) {
        this.dataSource = dataSource;
        this.asteroidRepository = asteroidRepository;
        this.transactionRepository = transactionRepository;
        this.miningExecutor = miningExecutor;
    }

    public Map<String, Object> trigger(String type) {
        return switch (type) {
            case "connection-leak" -> connectionLeak();
            case "thread-rejection" -> threadRejection();
            case "blocking-io" -> blockingIo();
            case "cpu-saturation" -> cpuSaturation();
            case "memory-leak" -> memoryLeak();
            case "log-growth" -> logGrowth();
            case "deadlock" -> deadlockScenario();
            case "race-condition" -> raceCondition();
            case "cache-stampede" -> cacheStampede();
            case "n-plus-one" -> nPlusOne();
            case "long-transaction" -> longTransaction();
            default -> Map.of("status", "unknown-fault", "type", type);
        };
    }

    public Map<String, Object> connectionLeak() {
        try {
            Connection connection = DataSourceUtils.getConnection(dataSource);
            connection.createStatement().execute("select 1");
            // Intentionally not releasing the connection to simulate pool exhaustion.
            return Map.of("status", "leaked", "connection", connection.toString());
        } catch (Exception e) {
            return Map.of("status", "pool-pressure", "error", e.getMessage());
        }
    }

    public Map<String, Object> threadRejection() {
        int rejected = 0;
        for (int i = 0; i < 14; i++) {
            try {
                miningExecutor.execute(() -> sleep(3500));
            } catch (RuntimeException ex) {
                rejected++;
            }
        }
        return Map.of(
                "status", "submitted",
                "active", miningExecutor.getActiveCount(),
                "queue", miningExecutor.getQueue().size(),
                "rejected", rejected
        );
    }

    public Map<String, Object> blockingIo() {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("http://10.255.255.1/slow-mining-relay"))
                    .timeout(java.time.Duration.ofMillis(1800))
                    .GET()
                    .build();
            HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
            return Map.of("status", "relay-complete");
        } catch (Exception e) {
            return Map.of("status", "thread-blocked", "latencyMs", 1800, "error", e.getClass().getSimpleName());
        }
    }

    public Map<String, Object> cpuSaturation() {
        long checksum = 0;
        for (int i = 2; i < 180000; i++) {
            if (isPrime(i)) {
                checksum += i;
            }
        }
        return Map.of("status", "cpu-spike", "checksum", checksum);
    }

    public Map<String, Object> memoryLeak() {
        LEAKED_TELEMETRY_FRAMES.add(new byte[1024 * 512]);
        return Map.of("status", "retained", "frames", LEAKED_TELEMETRY_FRAMES.size(), "approxMb", LEAKED_TELEMETRY_FRAMES.size() / 2);
    }

    public Map<String, Object> logGrowth() {
        for (int i = 0; i < 1600; i++) {
            log.warn("ORE_STREAM_AUDIT seq={} payload={} status=UNBOUNDED_APPEND", i, "X".repeat(300));
        }
        return Map.of("status", "log-growth", "lines", 1600);
    }

    public Map<String, Object> deadlockScenario() {
        Thread first = new Thread(() -> {
            synchronized (inventoryLock) {
                sleep(200);
                synchronized (settlementLock) {
                    log.info("inventory then settlement acquired");
                }
            }
        }, "deadlock-inventory");
        Thread second = new Thread(() -> {
            synchronized (settlementLock) {
                sleep(200);
                synchronized (inventoryLock) {
                    log.info("settlement then inventory acquired");
                }
            }
        }, "deadlock-settlement");
        first.start();
        second.start();
        return Map.of("status", "deadlock-seeded", "threads", List.of(first.getName(), second.getName()));
    }

    public Map<String, Object> raceCondition() {
        List<Thread> threads = new ArrayList<>();
        for (int i = 0; i < 80; i++) {
            Thread t = new Thread(() -> unsafeLedgerCounter++);
            threads.add(t);
            t.start();
        }
        threads.forEach(t -> {
            try {
                t.join();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        return Map.of("status", "non-atomic-ledger", "counter", unsafeLedgerCounter);
    }

    public Map<String, Object> cacheStampede() {
        CACHE.remove("mineral-price-index");
        List<Thread> threads = new ArrayList<>();
        for (int i = 0; i < 16; i++) {
            threads.add(new Thread(() -> {
                if (!CACHE.containsKey("mineral-price-index")) {
                sleep(850);
                    CACHE.put("mineral-price-index", asteroidRepository.findAll().size() * random.nextInt(100));
                }
            }));
        }
        threads.forEach(Thread::start);
        threads.forEach(t -> {
            try {
                t.join();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        return Map.of("status", "stampede-window", "cacheKeys", CACHE.keySet());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> nPlusOne() {
        List<MiningTransaction> transactions = transactionRepository.findAll();
        List<String> sectors = transactions.stream()
                .map(tx -> tx.getAsteroid().getSectorCode())
                .toList();
        return Map.of("status", "n-plus-one-query", "rows", transactions.size(), "sectors", sectors.size());
    }

    @Transactional
    public Map<String, Object> longTransaction() {
        Asteroid asteroid = asteroidRepository.findAll().get(0);
        transactionRepository.save(new MiningTransaction("MX-LAG-9094", 9094, Instant.now(), asteroid));
        sleep(2200);
        return Map.of("status", "long-transaction", "heldMs", 2200);
    }

    public List<Map<String, Object>> vulnerabilityCatalog() {
        List<Map<String, Object>> catalog = new ArrayList<>();
        add(catalog, "connection-leak", "DB 커넥션 반환 누락", "critical");
        add(catalog, "thread-rejection", "Thread Pool Rejection", "high");
        add(catalog, "blocking-io", "동기 I/O 블로킹", "high");
        add(catalog, "cpu-saturation", "CPU 100% 점유", "critical");
        add(catalog, "memory-leak", "정적 컬렉션 메모리 누수", "critical");
        add(catalog, "log-growth", "로그 파일 무한 증식", "medium");
        add(catalog, "deadlock", "상호 참조 락 데드락", "critical");
        add(catalog, "race-condition", "원자성 누락 레이스 컨디션", "high");
        add(catalog, "cache-stampede", "캐시 스탬피드", "high");
        add(catalog, "n-plus-one", "ORM N+1 쿼리", "medium");
        add(catalog, "long-transaction", "외부 지연 장기 트랜잭션", "high");
        return catalog;
    }

    private void add(List<Map<String, Object>> catalog, String key, String title, String severity) {
        catalog.add(Map.of("key", key, "title", title, "severity", severity));
    }

    private boolean isPrime(int value) {
        for (int i = 2; i * i <= value; i++) {
            if (value % i == 0) {
                return false;
            }
        }
        return true;
    }

    private void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
