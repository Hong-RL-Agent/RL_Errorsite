package com.zenith;

import com.zenith.model.Property;
import com.zenith.model.User;
import jakarta.persistence.EntityManager;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    private final EntityManager entityManager;

    public DataInitializer(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Init properties
        entityManager.persist(new Property(
            "Luxury Villa with Infinity Pool", "Bali, Indonesia", 550000, 
            "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=800",
            "Experience ultimate luxury in this modern villa featuring an infinity pool overlooking the ocean.",
            Arrays.asList(
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1600607687931-cebf5871c0eb?auto=format&fit=crop&q=80&w=800"
            )
        ));
        entityManager.persist(new Property(
            "Cozy Alpine Chalet", "Zermatt, Switzerland", 350000, 
            "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=800",
            "A traditional wooden chalet with breathtaking views of the Matterhorn.",
            Arrays.asList(
                "https://images.unsplash.com/photo-1499803270242-467f2e153139?auto=format&fit=crop&q=80&w=800"
            )
        ));
        entityManager.persist(new Property(
            "Modern Downtown Loft", "New York City, USA", 420000, 
            "https://images.unsplash.com/photo-1502672260266-1c1e52d15461?auto=format&fit=crop&q=80&w=800",
            "Spacious loft in the heart of the city with modern industrial design.",
            Arrays.asList(
                "https://images.unsplash.com/photo-1502672260266-1c1e52d15461?auto=format&fit=crop&q=80&w=800"
            )
        ));
        
        // Init secret users
        entityManager.persist(new User("admin", "c3lzdGVtX2FkbWluX3B3Xzk5MjE=", "admin@zenith.local"));
        entityManager.persist(new User("testqa", "cWEtcGFzcy0xMjM=", "qa@zenith.local"));
    }
}
