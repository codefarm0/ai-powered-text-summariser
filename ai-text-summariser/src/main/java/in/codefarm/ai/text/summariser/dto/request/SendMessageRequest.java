package in.codefarm.ai.text.summariser.dto.request;

import jakarta.validation.constraints.NotBlank;

public class SendMessageRequest {

    @NotBlank(message = "Message is required")
    private String message;

    @NotBlank(message = "Model is required")
    private String model;

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
}
