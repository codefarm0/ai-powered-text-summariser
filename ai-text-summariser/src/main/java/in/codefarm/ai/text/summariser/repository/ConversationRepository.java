package in.codefarm.ai.text.summariser.repository;

import in.codefarm.ai.text.summariser.entity.ConversationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<ConversationEntity, Long> {

    List<ConversationEntity> findByProjectIdOrderByUpdatedAtDesc(Long projectId);

    @Query("SELECT c FROM ConversationEntity c WHERE c.id = :id AND c.project.id = :projectId AND c.project.user.publicId = :publicId")
    Optional<ConversationEntity> findByIdAndProjectIdAndProjectUserPublicId(
            @Param("id") Long id,
            @Param("projectId") Long projectId,
            @Param("publicId") String publicId);
}
