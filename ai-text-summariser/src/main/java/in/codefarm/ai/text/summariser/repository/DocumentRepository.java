package in.codefarm.ai.text.summariser.repository;

import in.codefarm.ai.text.summariser.entity.DocumentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<DocumentEntity, Long> {

    List<DocumentEntity> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    @Query("SELECT d FROM DocumentEntity d WHERE d.id = :id AND d.project.id = :projectId AND d.project.user.publicId = :publicId")
    Optional<DocumentEntity> findByIdAndProjectIdAndProjectUserPublicId(
            @Param("id") Long id,
            @Param("projectId") Long projectId,
            @Param("publicId") String publicId);
}
