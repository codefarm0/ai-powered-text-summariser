package in.codefarm.ai.text.summariser.controller;

import in.codefarm.ai.text.summariser.dto.response.ApiResponse;
import in.codefarm.ai.text.summariser.dto.response.DocumentResponse;
import in.codefarm.ai.text.summariser.entity.ProjectEntity;
import in.codefarm.ai.text.summariser.service.DocumentService;
import in.codefarm.ai.text.summariser.service.ProjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/documents")
public class DocumentController {

    private final DocumentService documentService;
    private final ProjectService projectService;

    public DocumentController(DocumentService documentService, ProjectService projectService) {
        this.documentService = documentService;
        this.projectService = projectService;
    }

    @PostMapping("/extract")
    public ResponseEntity<ApiResponse<DocumentResponse>> extractText(
            @RequestHeader("X-User-Id") String publicId,
            @PathVariable Long projectId,
            @RequestParam("file") MultipartFile file) {
        ProjectEntity project = projectService.getProjectEntity(publicId, projectId);
        DocumentResponse result = documentService.extractAndSave(file, project);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }
}
