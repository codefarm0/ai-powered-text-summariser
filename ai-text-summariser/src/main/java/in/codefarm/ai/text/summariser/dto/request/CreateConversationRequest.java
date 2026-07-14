package in.codefarm.ai.text.summariser.dto.request;

import jakarta.validation.constraints.NotBlank;

public class CreateConversationRequest {

    @NotBlank(message = "Title is required")
    private String title;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
}
