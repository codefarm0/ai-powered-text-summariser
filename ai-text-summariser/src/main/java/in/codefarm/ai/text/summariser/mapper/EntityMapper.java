package in.codefarm.ai.text.summariser.mapper;

import in.codefarm.ai.text.summariser.dto.response.ConversationResponse;
import in.codefarm.ai.text.summariser.dto.response.DocumentResponse;
import in.codefarm.ai.text.summariser.dto.response.MessageResponse;
import in.codefarm.ai.text.summariser.dto.response.ProjectResponse;
import in.codefarm.ai.text.summariser.dto.response.SummaryResponse;
import in.codefarm.ai.text.summariser.dto.response.UserResponse;
import in.codefarm.ai.text.summariser.entity.ConversationEntity;
import in.codefarm.ai.text.summariser.entity.DocumentEntity;
import in.codefarm.ai.text.summariser.entity.MessageEntity;
import in.codefarm.ai.text.summariser.entity.ProjectEntity;
import in.codefarm.ai.text.summariser.entity.SummaryEntity;
import in.codefarm.ai.text.summariser.entity.UserEntity;
import org.springframework.stereotype.Component;

@Component
public class EntityMapper {

    public UserResponse toUserResponse(UserEntity entity) {
        UserResponse r = new UserResponse();
        r.setPublicId(entity.getPublicId());
        r.setDisplayName(entity.getDisplayName());
        r.setPreferredModel(entity.getPreferredModel());
        r.setPreferredSummaryType(entity.getPreferredSummaryType());
        r.setCreatedAt(entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : null);
        r.setLastActiveAt(entity.getLastActiveAt() != null ? entity.getLastActiveAt().toString() : null);
        return r;
    }

    public ProjectResponse toProjectResponse(ProjectEntity entity) {
        ProjectResponse r = new ProjectResponse();
        r.setId(entity.getId());
        r.setName(entity.getName());
        r.setDescription(entity.getDescription());
        r.setDefaultModel(entity.getDefaultModel());
        r.setCreatedAt(entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : null);
        r.setUpdatedAt(entity.getUpdatedAt() != null ? entity.getUpdatedAt().toString() : null);
        return r;
    }

    public ConversationResponse toConversationResponse(ConversationEntity entity, int messageCount) {
        ConversationResponse r = new ConversationResponse();
        r.setId(entity.getId());
        r.setProjectId(entity.getProject().getId());
        r.setTitle(entity.getTitle());
        r.setCreatedAt(entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : null);
        r.setUpdatedAt(entity.getUpdatedAt() != null ? entity.getUpdatedAt().toString() : null);
        r.setMessageCount(messageCount);
        return r;
    }

    public MessageResponse toMessageResponse(MessageEntity entity) {
        MessageResponse r = new MessageResponse();
        r.setId(entity.getId());
        r.setConversationId(entity.getConversation().getId());
        r.setRole(entity.getRole());
        r.setContent(entity.getContent());
        r.setCreatedAt(entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : null);
        return r;
    }

    public DocumentResponse toDocumentResponse(DocumentEntity entity) {
        DocumentResponse r = new DocumentResponse();
        r.setId(entity.getId());
        r.setProjectId(entity.getProject().getId());
        r.setFileName(entity.getFileName());
        r.setFileSize(entity.getFileSize());
        r.setMimeType(entity.getMimeType());
        r.setExtractedText(entity.getExtractedText());
        r.setCreatedAt(entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : null);
        return r;
    }

    public SummaryResponse toSummaryResponse(SummaryEntity entity) {
        SummaryResponse r = new SummaryResponse();
        r.setId(entity.getId());
        r.setProjectId(entity.getProject().getId());
        r.setOriginalText(entity.getOriginalText());
        r.setSummary(entity.getSummary());
        r.setSummaryType(entity.getSummaryType());
        r.setModel(entity.getModel());
        r.setInputTokens(entity.getInputTokens());
        r.setOutputTokens(entity.getOutputTokens());
        r.setResponseTimeMs(entity.getResponseTimeMs());
        r.setCreatedAt(entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : null);
        return r;
    }
}
