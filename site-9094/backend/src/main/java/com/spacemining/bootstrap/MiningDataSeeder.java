package com.spacemining.bootstrap;

import com.spacemining.domain.Asteroid;
import com.spacemining.domain.MiningTransaction;
import com.spacemining.repository.AsteroidRepository;
import com.spacemining.repository.MiningTransactionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
public class MiningDataSeeder implements CommandLineRunner {
    private final AsteroidRepository asteroidRepository;
    private final MiningTransactionRepository transactionRepository;

    public MiningDataSeeder(AsteroidRepository asteroidRepository, MiningTransactionRepository transactionRepository) {
        this.asteroidRepository = asteroidRepository;
        this.transactionRepository = transactionRepository;
    }

    @Override
    public void run(String... args) {
        List<Asteroid> asteroids = List.of(
                new Asteroid("NEREID-09", "Helium-3", 97, 930000),
                new Asteroid("ABYSS-41", "Platinum", 88, 720000),
                new Asteroid("TRITON-22", "Iridium", 91, 580000),
                new Asteroid("PELAGIC-77", "Cobalt", 82, 430000),
                new Asteroid("ORCA-13", "Titanium", 79, 390000)
        );
        asteroidRepository.saveAll(asteroids);

        for (int i = 0; i < 36; i++) {
            Asteroid asteroid = asteroids.get(i % asteroids.size());
            transactionRepository.save(new MiningTransaction(
                    "MX-" + (700 + i),
                    1200L + (i * 317L),
                    Instant.now().minusSeconds(i * 240L),
                    asteroid
            ));
        }
    }
}
