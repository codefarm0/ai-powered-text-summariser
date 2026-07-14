package in.codefarm.ai.text.summariser.service;

import in.codefarm.ai.text.summariser.ai.prompt.SummaryPrompts;
import in.codefarm.ai.text.summariser.entity.MessageEntity;
import in.codefarm.ai.text.summariser.exception.AiServiceException;
import in.codefarm.ai.text.summariser.exception.InvalidModelException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.ollama.api.OllamaChatOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.List;

@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    private final ChatClient.Builder chatClientBuilder;
    private final List<String> availableModels;

    public AiService(
            ChatClient.Builder chatClientBuilder,
            @Value("${app.ai.available-models}") List<String> availableModels) {
        this.chatClientBuilder = chatClientBuilder;
        this.availableModels = availableModels;
    }

    public String generateSummary(String text, String summaryType, String model) {
        validateModel(model);

        String prompt = SummaryPrompts.buildSummaryPrompt(text, summaryType);

        long start = System.currentTimeMillis();

        try {
            ChatClient chatClient = chatClientBuilder.build();
            String response = chatClient.prompt()
                    .user(prompt)
                    .options(OllamaChatOptions.builder().model(model))
                    .call()
                    .content();

            long elapsed = System.currentTimeMillis() - start;
            log.info("AI summary generated with model={} in {}ms", model, elapsed);

            return response != null ? response.trim() : "";
        } catch (Exception e) {
            log.error("AI generation failed with model={}", model, e);
            throw new AiServiceException("Failed to generate summary: " + e.getMessage(), e);
        }
    }

    public Flux<String> streamSummary(String text, String summaryType, String model) {
        validateModel(model);

        String prompt = SummaryPrompts.buildSummaryPrompt(text, summaryType);

        try {
            ChatClient chatClient = chatClientBuilder.build();
            return chatClient.prompt()
                    .user(prompt)
                    .options(OllamaChatOptions.builder().model(model))
                    .stream()
                    .content();
        } catch (Exception e) {
            log.error("AI streaming failed with model={}", model, e);
            return Flux.error(new AiServiceException("Failed to stream summary: " + e.getMessage(), e));
        }
    }

    public Flux<String> streamChat(String userMessage, List<MessageEntity> history, String model, String projectContext) {
        validateModel(model);

        String prompt = buildChatPrompt(userMessage, history, projectContext);

        try {
            ChatClient chatClient = chatClientBuilder.build();
            return chatClient.prompt()
                    .user(prompt)
                    .options(OllamaChatOptions.builder().model(model))
                    .stream()
                    .content();
        } catch (Exception e) {
            log.error("AI chat streaming failed with model={}", model, e);
            return Flux.error(new AiServiceException("Failed to process chat message: " + e.getMessage(), e));
        }
    }

    private String buildChatPrompt(String userMessage, List<MessageEntity> history, String projectContext) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are a helpful AI assistant integrated into a document summarisation application. ");
        sb.append("Respond to the user's questions using the provided project context (documents and summaries) and conversation history.\n\n");

        if (projectContext != null && !projectContext.isBlank()) {
            sb.append("## Project Context\n");
            sb.append(projectContext);
            sb.append("\n\n");
        }

        if (!history.isEmpty()) {
            sb.append("## Conversation History\n");
            for (MessageEntity msg : history) {
                String role = msg.getRole().equalsIgnoreCase("USER") ? "User" : "Assistant";
                sb.append(role).append(": ").append(msg.getContent()).append("\n");
            }
            sb.append("\n");
        }

        sb.append("## Current Message\n");
        sb.append("User: ").append(userMessage).append("\n\n");
        sb.append("## Response\n");
        sb.append("Assistant: ");

        return sb.toString();
    }

    public List<String> getAvailableModels() {
        return availableModels;
    }

    public boolean isModelAvailable(String model) {
        return availableModels.contains(model);
    }

    private void validateModel(String model) {
        if (!availableModels.contains(model)) {
            throw new InvalidModelException(
                    "Unsupported model: " + model + ". Available: " + availableModels);
        }
    }
}
