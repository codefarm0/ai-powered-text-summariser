package in.codefarm.ai.text.summariser.service;

import in.codefarm.ai.text.summariser.dto.request.CreateProjectRequest;
import in.codefarm.ai.text.summariser.dto.request.UpdateProjectRequest;
import in.codefarm.ai.text.summariser.dto.response.PagedResponse;
import in.codefarm.ai.text.summariser.dto.response.ProjectResponse;
import in.codefarm.ai.text.summariser.entity.ProjectEntity;
import in.codefarm.ai.text.summariser.entity.UserEntity;
import in.codefarm.ai.text.summariser.exception.ProjectNotFoundException;
import in.codefarm.ai.text.summariser.mapper.EntityMapper;
import in.codefarm.ai.text.summariser.repository.ProjectRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserService userService;
    private final EntityMapper mapper;

    public ProjectService(ProjectRepository projectRepository, UserService userService, EntityMapper mapper) {
        this.projectRepository = projectRepository;
        this.userService = userService;
        this.mapper = mapper;
    }

    @Transactional
    public ProjectResponse createProject(String publicId, CreateProjectRequest request) {
        UserEntity user = userService.getUserEntity(publicId);
        ProjectEntity entity = new ProjectEntity();
        entity.setUser(user);
        entity.setName(request.getName());
        entity.setDescription(request.getDescription() != null ? request.getDescription() : "");
        entity.setDefaultModel(user.getPreferredModel() != null ? user.getPreferredModel() : "mistral");
        entity = projectRepository.save(entity);
        return mapper.toProjectResponse(entity);
    }

    public PagedResponse<ProjectResponse> getProjects(String publicId, int page, int size) {
        Page<ProjectEntity> projectPage = projectRepository.findByUserPublicId(
                publicId, PageRequest.of(page, size));
        var content = projectPage.getContent().stream()
                .map(mapper::toProjectResponse)
                .toList();
        return new PagedResponse<>(projectPage, content);
    }

    public ProjectResponse getProject(String publicId, Long projectId) {
        ProjectEntity entity = projectRepository.findByIdAndUserPublicId(projectId, publicId)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found: " + projectId));
        return mapper.toProjectResponse(entity);
    }

    @Transactional
    public ProjectResponse updateProject(String publicId, Long projectId, UpdateProjectRequest request) {
        ProjectEntity entity = projectRepository.findByIdAndUserPublicId(projectId, publicId)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found: " + projectId));
        if (request.getName() != null) {
            entity.setName(request.getName());
        }
        if (request.getDescription() != null) {
            entity.setDescription(request.getDescription());
        }
        entity = projectRepository.save(entity);
        return mapper.toProjectResponse(entity);
    }

    @Transactional
    public void deleteProject(String publicId, Long projectId) {
        ProjectEntity entity = projectRepository.findByIdAndUserPublicId(projectId, publicId)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found: " + projectId));
        projectRepository.delete(entity);
    }

    public ProjectEntity getProjectEntity(String publicId, Long projectId) {
        return projectRepository.findByIdAndUserPublicId(projectId, publicId)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found: " + projectId));
    }
}
