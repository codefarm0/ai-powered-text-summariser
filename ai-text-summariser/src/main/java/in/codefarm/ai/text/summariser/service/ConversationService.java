package in.codefarm.ai.text.summariser.service;

import in.codefarm.ai.text.summariser.dto.response.ConversationResponse;
import in.codefarm.ai.text.summariser.dto.response.MessageResponse;
import in.codefarm.ai.text.summariser.entity.ConversationEntity;
import in.codefarm.ai.text.summariser.entity.DocumentEntity;
import in.codefarm.ai.text.summariser.entity.MessageEntity;
import in.codefarm.ai.text.summariser.entity.ProjectEntity;
import in.codefarm.ai.text.summariser.entity.SummaryEntity;
import in.codefarm.ai.text.summariser.exception.ConversationNotFoundException;
import in.codefarm.ai.text.summariser.mapper.EntityMapper;
import in.codefarm.ai.text.summariser.repository.ConversationRepository;
import in.codefarm.ai.text.summariser.repository.DocumentRepository;
import in.codefarm.ai.text.summariser.repository.MessageRepository;
import in.codefarm.ai.text.summariser.repository.SummaryRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;

import java.util.List;

@Service
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final DocumentRepository documentRepository;
    private final SummaryRepository summaryRepository;
    private final ProjectService projectService;
    private final AiService aiService;
    private final EntityMapper mapper;

    public ConversationService(ConversationRepository conversationRepository,
                                MessageRepository messageRepository,
                                DocumentRepository documentRepository,
                                SummaryRepository summaryRepository,
                                ProjectService projectService,
                                AiService aiService,
                                EntityMapper mapper) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.documentRepository = documentRepository;
        this.summaryRepository = summaryRepository;
        this.projectService = projectService;
        this.aiService = aiService;
        this.mapper = mapper;
    }

    @Transactional
    public ConversationResponse createConversation(String publicId, Long projectId, String title) {
        ProjectEntity project = projectService.getProjectEntity(publicId, projectId);
        ConversationEntity entity = new ConversationEntity();
        entity.setProject(project);
        entity.setTitle(title);
        entity = conversationRepository.save(entity);
        return mapper.toConversationResponse(entity, 0);
    }

    public List<ConversationResponse> listConversations(String publicId, Long projectId) {
        projectService.getProjectEntity(publicId, projectId);
        return conversationRepository.findByProjectIdOrderByUpdatedAtDesc(projectId)
                .stream()
                .map(c -> mapper.toConversationResponse(c, messageRepository.findByConversationIdOrderByCreatedAtAsc(c.getId()).size()))
                .toList();
    }

    public ConversationResponse getConversation(String publicId, Long projectId, Long conversationId) {
        ConversationEntity entity = conversationRepository
                .findByIdAndProjectIdAndProjectUserPublicId(conversationId, projectId, publicId)
                .orElseThrow(() -> new ConversationNotFoundException("Conversation not found: " + conversationId));
        return mapper.toConversationResponse(entity,
                messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId).size());
    }

    @Transactional
    public void deleteConversation(String publicId, Long projectId, Long conversationId) {
        ConversationEntity entity = conversationRepository
                .findByIdAndProjectIdAndProjectUserPublicId(conversationId, projectId, publicId)
                .orElseThrow(() -> new ConversationNotFoundException("Conversation not found: " + conversationId));
        messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId)
                .forEach(messageRepository::delete);
        conversationRepository.delete(entity);
    }

    public List<MessageResponse> getMessages(String publicId, Long projectId, Long conversationId) {
        conversationRepository.findByIdAndProjectIdAndProjectUserPublicId(conversationId, projectId, publicId)
                .orElseThrow(() -> new ConversationNotFoundException("Conversation not found: " + conversationId));
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId)
                .stream()
                .map(mapper::toMessageResponse)
                .toList();
    }

    @Transactional
    public MessageResponse addMessage(String publicId, Long projectId, Long conversationId,
                                      String message, String model) {
        ConversationEntity conversation = conversationRepository
                .findByIdAndProjectIdAndProjectUserPublicId(conversationId, projectId, publicId)
                .orElseThrow(() -> new ConversationNotFoundException("Conversation not found: " + conversationId));

        MessageEntity userMsg = new MessageEntity();
        userMsg.setConversation(conversation);
        userMsg.setRole("USER");
        userMsg.setContent(message);
        userMsg = messageRepository.save(userMsg);

        return mapper.toMessageResponse(userMsg);
    }

    public Flux<String> streamChatResponse(String publicId, Long projectId, Long conversationId,
                                           String userMessage, String model) {
        ConversationEntity conversation = conversationRepository
                .findByIdAndProjectIdAndProjectUserPublicId(conversationId, projectId, publicId)
                .orElseThrow(() -> new ConversationNotFoundException("Conversation not found: " + conversationId));

        List<MessageEntity> history = messageRepository
                .findByConversationIdOrderByCreatedAtAsc(conversationId);

        String projectContext = buildProjectContext(publicId, projectId);

        return aiService.streamChat(userMessage, history, model, projectContext);
    }

    private String buildProjectContext(String publicId, Long projectId) {
        StringBuilder ctx = new StringBuilder();

        List<DocumentEntity> docs = documentRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
        if (!docs.isEmpty()) {
            ctx.append("### Uploaded Documents\n");
            for (DocumentEntity doc : docs) {
                ctx.append("- **").append(doc.getFileName()).append("**");
                if (doc.getExtractedText() != null && !doc.getExtractedText().isBlank()) {
                    String text = doc.getExtractedText();
                    if (text.length() > 3000) text = text.substring(0, 3000) + "...";
                    ctx.append(":\n").append(text);
                }
                ctx.append("\n");
            }
            ctx.append("\n");
        }

        List<SummaryEntity> summaries = summaryRepository
                .findByProjectIdAndProjectUserPublicId(projectId, publicId, PageRequest.of(0, 10))
                .getContent();
        if (!summaries.isEmpty()) {
            ctx.append("### Generated Summaries\n");
            for (SummaryEntity s : summaries) {
                ctx.append("- **Type:** ").append(s.getSummaryType())
                   .append(" **Model:** ").append(s.getModel()).append("\n");
                String summaryText = s.getSummary();
                if (summaryText.length() > 2000) summaryText = summaryText.substring(0, 2000) + "...";
                ctx.append("  ").append(summaryText).append("\n\n");
            }
        }

        return ctx.isEmpty() ? null : ctx.toString();
    }

    @Transactional
    public MessageResponse saveAiResponse(Long conversationId, String content) {
        ConversationEntity conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ConversationNotFoundException("Conversation not found: " + conversationId));

        MessageEntity aiMsg = new MessageEntity();
        aiMsg.setConversation(conversation);
        aiMsg.setRole("AI");
        aiMsg.setContent(content);
        aiMsg = messageRepository.save(aiMsg);

        conversation.setTitle(content.length() > 100 ? content.substring(0, 100) + "..." : content);
        conversationRepository.save(conversation);

        return mapper.toMessageResponse(aiMsg);
    }
}
