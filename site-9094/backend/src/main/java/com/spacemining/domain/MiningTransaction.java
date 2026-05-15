package com.spacemining.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

import java.time.Instant;

@Entity
public class MiningTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String vessel;
    private long units;
    private Instant settledAt;

    @ManyToOne(fetch = FetchType.LAZY)
    private Asteroid asteroid;

    protected MiningTransaction() {
    }

    public MiningTransaction(String vessel, long units, Instant settledAt, Asteroid asteroid) {
        this.vessel = vessel;
        this.units = units;
        this.settledAt = settledAt;
        this.asteroid = asteroid;
    }

    public Long getId() {
        return id;
    }

    public String getVessel() {
        return vessel;
    }

    public long getUnits() {
        return units;
    }

    public Instant getSettledAt() {
        return settledAt;
    }

    public Asteroid getAsteroid() {
        return asteroid;
    }
}
