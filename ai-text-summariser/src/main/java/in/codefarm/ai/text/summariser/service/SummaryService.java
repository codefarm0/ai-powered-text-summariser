package in.codefarm.ai.text.summariser.service;

import in.codefarm.ai.text.summariser.dto.request.GenerateSummaryRequest;
import in.codefarm.ai.text.summariser.dto.response.PagedResponse;
import in.codefarm.ai.text.summariser.dto.response.SummaryResponse;
import in.codefarm.ai.text.summariser.entity.ProjectEntity;
import in.codefarm.ai.text.summariser.entity.SummaryEntity;
import in.codefarm.ai.text.summariser.exception.SummaryNotFoundException;
import in.codefarm.ai.text.summariser.mapper.EntityMapper;
import in.codefarm.ai.text.summariser.repository.SummaryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;

@Service
public class SummaryService {

    private final SummaryRepository summaryRepository;
    private final AiService aiService;
    private final ProjectService projectService;
    private final EntityMapper mapper;

    public SummaryService(SummaryRepository summaryRepository, AiService aiService,
                          ProjectService projectService, EntityMapper mapper) {
        this.summaryRepository = summaryRepository;
        this.aiService = aiService;
        this.projectService = projectService;
        this.mapper = mapper;
    }

    @Transactional
    public SummaryResponse generateSummary(String publicId, Long projectId, GenerateSummaryRequest request) {
        ProjectEntity project = projectService.getProjectEntity(publicId, projectId);

        long start = System.currentTimeMillis();
        String summary = aiService.generateSummary(request.getText(), request.getSummaryType(), request.getModel());
        long responseTime = System.currentTimeMillis() - start;

        SummaryEntity entity = new SummaryEntity();
        entity.setProject(project);
        entity.setOriginalText(request.getText());
        entity.setSummary(summary);
        entity.setSummaryType(request.getSummaryType());
        entity.setModel(request.getModel());
        entity.setInputTokens(estimateTokens(request.getText()));
        entity.setOutputTokens(estimateTokens(summary));
        entity.setResponseTimeMs((int) responseTime);
        entity = summaryRepository.save(entity);

        return mapper.toSummaryResponse(entity);
    }

    public Flux<String> streamSummary(String publicId, Long projectId, GenerateSummaryRequest request) {
        projectService.getProjectEntity(publicId, projectId);
        return aiService.streamSummary(request.getText(), request.getSummaryType(), request.getModel());
    }

    public PagedResponse<SummaryResponse> getSummaries(String publicId, Long projectId,
                                                        int page, int size,
                                                        String summaryType, String model) {
        Page<SummaryEntity> summaryPage = summaryRepository.findByFilters(
                projectId, publicId,
                summaryType != null && !summaryType.isEmpty() ? summaryType : null,
                model != null && !model.isEmpty() ? model : null,
                PageRequest.of(page, size));
        var content = summaryPage.getContent().stream()
                .map(mapper::toSummaryResponse)
                .toList();
        return new PagedResponse<>(summaryPage, content);
    }

    public SummaryResponse getSummary(String publicId, Long projectId, Long summaryId) {
        SummaryEntity entity = summaryRepository.findByIdAndProjectIdAndProjectUserPublicId(summaryId, projectId, publicId)
                .orElseThrow(() -> new SummaryNotFoundException("Summary not found: " + summaryId));
        return mapper.toSummaryResponse(entity);
    }

    @Transactional
    public void deleteSummary(String publicId, Long projectId, Long summaryId) {
        SummaryEntity entity = summaryRepository.findByIdAndProjectIdAndProjectUserPublicId(summaryId, projectId, publicId)
                .orElseThrow(() -> new SummaryNotFoundException("Summary not found: " + summaryId));
        summaryRepository.delete(entity);
    }

    private int estimateTokens(String text) {
        if (text == null || text.isEmpty()) return 0;
        return (int) (text.split("\\s+").length * 1.3);
    }
}
