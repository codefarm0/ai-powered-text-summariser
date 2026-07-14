package in.codefarm.ai.text.summariser.dto.request;

import jakarta.validation.constraints.NotBlank;

public class StreamSummaryRequest {

    @NotBlank(message = "Text to summarize is required")
    private String text;

    @NotBlank(message = "Summary type is required")
    private String summaryType;

    @NotBlank(message = "Model is required")
    private String model;

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public String getSummaryType() { return summaryType; }
    public void setSummaryType(String summaryType) { this.summaryType = summaryType; }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
}
