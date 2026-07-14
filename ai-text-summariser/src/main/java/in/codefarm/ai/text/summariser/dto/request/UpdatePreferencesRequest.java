package in.codefarm.ai.text.summariser.dto.request;

public class UpdatePreferencesRequest {

    private String preferredModel;
    private String preferredSummaryType;

    public String getPreferredModel() { return preferredModel; }
    public void setPreferredModel(String preferredModel) { this.preferredModel = preferredModel; }
    public String getPreferredSummaryType() { return preferredSummaryType; }
    public void setPreferredSummaryType(String preferredSummaryType) { this.preferredSummaryType = preferredSummaryType; }
}
