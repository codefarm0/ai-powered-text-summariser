package in.codefarm.ai.text.summariser.repository;

import in.codefarm.ai.text.summariser.entity.ProjectEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProjectRepository extends JpaRepository<ProjectEntity, Long> {
    Page<ProjectEntity> findByUserPublicId(String publicId, Pageable pageable);
    Optional<ProjectEntity> findByIdAndUserPublicId(Long id, String publicId);
    boolean existsByIdAndUserPublicId(Long id, String publicId);
}
