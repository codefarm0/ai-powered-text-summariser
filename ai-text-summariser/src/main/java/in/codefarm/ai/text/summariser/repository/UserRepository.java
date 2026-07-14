package in.codefarm.ai.text.summariser.repository;

import in.codefarm.ai.text.summariser.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByPublicId(String publicId);
    boolean existsByPublicId(String publicId);
}
