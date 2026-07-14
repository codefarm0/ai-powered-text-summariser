package in.codefarm.ai.text.summariser.controller;

import in.codefarm.ai.text.summariser.dto.request.GenerateSummaryRequest;
import in.codefarm.ai.text.summariser.dto.response.ApiResponse;
import in.codefarm.ai.text.summariser.dto.response.PagedResponse;
import in.codefarm.ai.text.summariser.dto.response.SummaryResponse;
import in.codefarm.ai.text.summariser.service.SummaryService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/summaries")
public class SummaryController {

    private final SummaryService summaryService;

    public SummaryController(SummaryService summaryService) {
        this.summaryService = summaryService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SummaryResponse>> generateSummary(
            @RequestHeader("X-User-Id") String publicId,
            @PathVariable Long projectId,
            @Valid @RequestBody GenerateSummaryRequest request) {
        SummaryResponse summary = summaryService.generateSummary(publicId, projectId, request);
        return ResponseEntity.ok(ApiResponse.ok(summary));
    }

    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamSummary(
            @RequestHeader("X-User-Id") String publicId,
            @PathVariable Long projectId,
            @Valid @RequestBody GenerateSummaryRequest request) {
        return summaryService.streamSummary(publicId, projectId, request);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<SummaryResponse>>> getSummaries(
            @RequestHeader("X-User-Id") String publicId,
            @PathVariable Long projectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String summaryType,
            @RequestParam(required = false) String model) {
        PagedResponse<SummaryResponse> summaries =
                summaryService.getSummaries(publicId, projectId, page, size, summaryType, model);
        return ResponseEntity.ok(ApiResponse.ok(summaries));
    }

    @GetMapping("/{summaryId}")
    public ResponseEntity<ApiResponse<SummaryResponse>> getSummary(
            @RequestHeader("X-User-Id") String publicId,
            @PathVariable Long projectId,
            @PathVariable Long summaryId) {
        SummaryResponse summary = summaryService.getSummary(publicId, projectId, summaryId);
        return ResponseEntity.ok(ApiResponse.ok(summary));
    }

    @DeleteMapping("/{summaryId}")
    public ResponseEntity<Void> deleteSummary(
            @RequestHeader("X-User-Id") String publicId,
            @PathVariable Long projectId,
            @PathVariable Long summaryId) {
        summaryService.deleteSummary(publicId, projectId, summaryId);
        return ResponseEntity.noContent().build();
    }
}
