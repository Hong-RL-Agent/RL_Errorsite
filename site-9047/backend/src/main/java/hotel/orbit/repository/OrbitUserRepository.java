package hotel.orbit.repository;

import hotel.orbit.model.OrbitUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrbitUserRepository extends JpaRepository<OrbitUser, Long> {
}
