package com.spacemining.repository;

import com.spacemining.domain.Asteroid;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AsteroidRepository extends JpaRepository<Asteroid, Long> {
}
