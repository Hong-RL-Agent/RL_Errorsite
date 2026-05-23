package com.fuzzing.agent.repository;

import com.fuzzing.agent.domain.Item;
import com.fuzzing.agent.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByUser(User user);
}
