package in.codefarm.ai.text.summariser.dto.request;

import jakarta.validation.constraints.NotBlank;

public class SaveAiMessageRequest {

    @NotBlank(message = "Content is required")
    private String content;

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
