package in.codefarm.ai.text.summariser.controller;

import in.codefarm.ai.text.summariser.dto.request.CreateConversationRequest;
import in.codefarm.ai.text.summariser.dto.request.SaveAiMessageRequest;
import in.codefarm.ai.text.summariser.dto.request.SendMessageRequest;
import in.codefarm.ai.text.summariser.dto.response.ApiResponse;
import in.codefarm.ai.text.summariser.dto.response.ConversationResponse;
import in.codefarm.ai.text.summariser.dto.response.MessageResponse;
import in.codefarm.ai.text.summariser.service.ConversationService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/conversations")
public class ConversationController {

    private final ConversationService conversationService;

    public ConversationController(ConversationService conversationService) {
        this.conversationService = conversationService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ConversationResponse>> createConversation(
            @RequestHeader("X-User-Id") String publicId,
            @PathVariable Long projectId,
            @Valid @RequestBody CreateConversationRequest request) {
        ConversationResponse result = conversationService.createConversation(publicId, projectId, request.getTitle());
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ConversationResponse>>> listConversations(
            @RequestHeader("X-User-Id") String publicId,
            @PathVariable Long projectId) {
        List<ConversationResponse> result = conversationService.listConversations(publicId, projectId);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/{conversationId}")
    public ResponseEntity<ApiResponse<ConversationResponse>> getConversation(
            @RequestHeader("X-User-Id") String publicId,
            @PathVariable Long projectId,
            @PathVariable Long conversationId) {
        ConversationResponse result = conversationService.getConversation(publicId, projectId, conversationId);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @DeleteMapping("/{conversationId}")
    public ResponseEntity<Void> deleteConversation(
            @RequestHeader("X-User-Id") String publicId,
            @PathVariable Long projectId,
            @PathVariable Long conversationId) {
        conversationService.deleteConversation(publicId, projectId, conversationId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{conversationId}/messages")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getMessages(
            @RequestHeader("X-User-Id") String publicId,
            @PathVariable Long projectId,
            @PathVariable Long conversationId) {
        List<MessageResponse> result = conversationService.getMessages(publicId, projectId, conversationId);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping("/{conversationId}/messages")
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(
            @RequestHeader("X-User-Id") String publicId,
            @PathVariable Long projectId,
            @PathVariable Long conversationId,
            @Valid @RequestBody SendMessageRequest request) {
        MessageResponse result = conversationService.addMessage(publicId, projectId, conversationId,
                request.getMessage(), request.getModel());
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping(value = "/{conversationId}/messages/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamChatResponse(
            @RequestHeader("X-User-Id") String publicId,
            @PathVariable Long projectId,
            @PathVariable Long conversationId,
            @Valid @RequestBody SendMessageRequest request) {
        return conversationService.streamChatResponse(publicId, projectId, conversationId,
                request.getMessage(), request.getModel());
    }

    @PostMapping("/{conversationId}/messages/save")
    public ResponseEntity<ApiResponse<MessageResponse>> saveAiResponse(
            @PathVariable Long conversationId,
            @Valid @RequestBody SaveAiMessageRequest request) {
        MessageResponse result = conversationService.saveAiResponse(conversationId, request.getContent());
        return ResponseEntity.ok(ApiResponse.ok(result));
    }
}
