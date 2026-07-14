package in.codefarm.ai.text.summariser.repository;

import in.codefarm.ai.text.summariser.entity.SummaryEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface SummaryRepository extends JpaRepository<SummaryEntity, Long> {

    Page<SummaryEntity> findByProjectIdAndProjectUserPublicId(
            Long projectId, String publicId, Pageable pageable);

    @Query("""
        SELECT s FROM SummaryEntity s
        WHERE s.project.id = :projectId
        AND s.project.user.publicId = :publicId
        AND (:summaryType IS NULL OR s.summaryType = :summaryType)
        AND (:model IS NULL OR s.model = :model)
        """)
    Page<SummaryEntity> findByFilters(
            @Param("projectId") Long projectId,
            @Param("publicId") String publicId,
            @Param("summaryType") String summaryType,
            @Param("model") String model,
            Pageable pageable);

    Optional<SummaryEntity> findByIdAndProjectIdAndProjectUserPublicId(
            Long id, Long projectId, String publicId);

    void deleteByIdAndProjectIdAndProjectUserPublicId(Long id, Long projectId, String publicId);
}
