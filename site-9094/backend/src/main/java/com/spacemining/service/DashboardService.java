package com.spacemining.service;

import com.spacemining.domain.Asteroid;
import com.spacemining.domain.MiningTransaction;
import com.spacemining.dto.MiningDashboardResponse;
import com.spacemining.repository.AsteroidRepository;
import com.spacemining.repository.MiningTransactionRepository;
import org.springframework.stereotype.Service;

import java.lang.management.ManagementFactory;
import java.time.Instant;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class DashboardService {
    private final AsteroidRepository asteroidRepository;
    private final MiningTransactionRepository transactionRepository;
    private final PerformanceFaultLab faultLab;
    private final Random random = new Random();

    public DashboardService(
            AsteroidRepository asteroidRepository,
            MiningTransactionRepository transactionRepository,
            PerformanceFaultLab faultLab
    ) {
        this.asteroidRepository = asteroidRepository;
        this.transactionRepository = transactionRepository;
        this.faultLab = faultLab;
    }

    public MiningDashboardResponse dashboard() {
        Runtime runtime = Runtime.getRuntime();
        long usedMemory = runtime.totalMemory() - runtime.freeMemory();
        double memoryPercent = usedMemory * 100.0 / runtime.maxMemory();
        double uptimeMinutes = ManagementFactory.getRuntimeMXBean().getUptime() / 60000.0;

        List<Map<String, Object>> asteroids = asteroidRepository.findAll().stream()
                .map(this::toAsteroidMap)
                .toList();

        List<Map<String, Object>> transactions = transactionRepository.findAll().stream()
                .sorted(Comparator.comparing(MiningTransaction::getSettledAt).reversed())
                .limit(9)
                .map(this::toTransactionMap)
                .toList();

        Map<String, Object> telemetry = new HashMap<>();
        telemetry.put("cpu", 42 + random.nextInt(37));
        telemetry.put("memory", Math.round(memoryPercent));
        telemetry.put("dbPool", 54 + random.nextInt(31));
        telemetry.put("latency", 80 + random.nextInt(290));
        telemetry.put("throughput", 1200 + random.nextInt(900));
        telemetry.put("uptimeMinutes", Math.round(uptimeMinutes));
        telemetry.put("port", 9094);

        List<String> logs = List.of(
                Instant.now() + " ORBITAL_LINK stable http://localhost:9094/api/dashboard",
                Instant.now() + " MINERAL_SETTLEMENT batch=HX-77 status=COMMITTED",
                Instant.now() + " POOL_MONITOR hikari.active threshold=watch",
                Instant.now() + " PPO_SIGNAL anomaly-window=11 fault-patterns=armed",
                Instant.now() + " EXTRACTOR_CLUSTER abyssal-blue-line load=" + telemetry.get("cpu") + "%"
        );

        return new MiningDashboardResponse(asteroids, transactions, telemetry, logs, faultLab.vulnerabilityCatalog());
    }

    private Map<String, Object> toAsteroidMap(Asteroid asteroid) {
        return Map.of(
                "id", asteroid.getId(),
                "sectorCode", asteroid.getSectorCode(),
                "mineralClass", asteroid.getMineralClass(),
                "purity", asteroid.getPurity(),
                "estimatedYield", asteroid.getEstimatedYield(),
                "progress", 35 + random.nextInt(61)
        );
    }

    private Map<String, Object> toTransactionMap(MiningTransaction transaction) {
        return Map.of(
                "id", transaction.getId(),
                "vessel", transaction.getVessel(),
                "units", transaction.getUnits(),
                "settledAt", transaction.getSettledAt().toString()
        );
    }
}
