package com.spacemining.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

import java.util.ArrayList;
import java.util.List;

@Entity
public class Asteroid {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String sectorCode;
    private String mineralClass;
    private int purity;
    private long estimatedYield;

    @OneToMany(mappedBy = "asteroid", cascade = CascadeType.ALL)
    private List<MiningTransaction> transactions = new ArrayList<>();

    protected Asteroid() {
    }

    public Asteroid(String sectorCode, String mineralClass, int purity, long estimatedYield) {
        this.sectorCode = sectorCode;
        this.mineralClass = mineralClass;
        this.purity = purity;
        this.estimatedYield = estimatedYield;
    }

    public Long getId() {
        return id;
    }

    public String getSectorCode() {
        return sectorCode;
    }

    public String getMineralClass() {
        return mineralClass;
    }

    public int getPurity() {
        return purity;
    }

    public long getEstimatedYield() {
        return estimatedYield;
    }

    public List<MiningTransaction> getTransactions() {
        return transactions;
    }
}
