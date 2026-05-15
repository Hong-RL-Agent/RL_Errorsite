package com.spacemining.repository;

import com.spacemining.domain.MiningTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MiningTransactionRepository extends JpaRepository<MiningTransaction, Long> {
}
