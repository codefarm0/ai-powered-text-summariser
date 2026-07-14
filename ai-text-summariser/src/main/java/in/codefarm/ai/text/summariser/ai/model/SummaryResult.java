package in.codefarm.ai.text.summariser.ai.model;

import java.util.List;

public class SummaryResult {

    private String title;
    private String summary;
    private List<String> keywords;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public List<String> getKeywords() { return keywords; }
    public void setKeywords(List<String> keywords) { this.keywords = keywords; }
}
