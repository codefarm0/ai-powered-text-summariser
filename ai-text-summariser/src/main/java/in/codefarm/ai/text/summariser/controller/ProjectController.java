package in.codefarm.ai.text.summariser.controller;

import in.codefarm.ai.text.summariser.dto.request.CreateProjectRequest;
import in.codefarm.ai.text.summariser.dto.request.UpdateProjectRequest;
import in.codefarm.ai.text.summariser.dto.response.ApiResponse;
import in.codefarm.ai.text.summariser.dto.response.PagedResponse;
import in.codefarm.ai.text.summariser.dto.response.ProjectResponse;
import in.codefarm.ai.text.summariser.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
            @RequestHeader("X-User-Id") String publicId,
            @Valid @RequestBody CreateProjectRequest request) {
        ProjectResponse project = projectService.createProject(publicId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(project));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<ProjectResponse>>> getProjects(
            @RequestHeader("X-User-Id") String publicId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<ProjectResponse> projects = projectService.getProjects(publicId, page, size);
        return ResponseEntity.ok(ApiResponse.ok(projects));
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProject(
            @RequestHeader("X-User-Id") String publicId,
            @PathVariable Long projectId) {
        ProjectResponse project = projectService.getProject(publicId, projectId);
        return ResponseEntity.ok(ApiResponse.ok(project));
    }

    @PutMapping("/{projectId}")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(
            @RequestHeader("X-User-Id") String publicId,
            @PathVariable Long projectId,
            @Valid @RequestBody UpdateProjectRequest request) {
        ProjectResponse project = projectService.updateProject(publicId, projectId, request);
        return ResponseEntity.ok(ApiResponse.ok(project));
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<Void> deleteProject(
            @RequestHeader("X-User-Id") String publicId,
            @PathVariable Long projectId) {
        projectService.deleteProject(publicId, projectId);
        return ResponseEntity.noContent().build();
    }
}
