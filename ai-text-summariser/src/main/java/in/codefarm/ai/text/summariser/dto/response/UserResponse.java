package in.codefarm.ai.text.summariser.dto.response;

public class UserResponse {

    private String publicId;
    private String displayName;
    private String preferredModel;
    private String preferredSummaryType;
    private String createdAt;
    private String lastActiveAt;

    public String getPublicId() { return publicId; }
    public void setPublicId(String publicId) { this.publicId = publicId; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public String getPreferredModel() { return preferredModel; }
    public void setPreferredModel(String preferredModel) { this.preferredModel = preferredModel; }
    public String getPreferredSummaryType() { return preferredSummaryType; }
    public void setPreferredSummaryType(String preferredSummaryType) { this.preferredSummaryType = preferredSummaryType; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public String getLastActiveAt() { return lastActiveAt; }
    public void setLastActiveAt(String lastActiveAt) { this.lastActiveAt = lastActiveAt; }
}
