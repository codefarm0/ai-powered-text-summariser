package in.codefarm.ai.text.summariser.dto.response;

public class DocumentExtractResponse {

    private String fileName;
    private String extractedText;
    private long fileSize;
    private String mimeType;

    public DocumentExtractResponse(String fileName, String extractedText, long fileSize, String mimeType) {
        this.fileName = fileName;
        this.extractedText = extractedText;
        this.fileSize = fileSize;
        this.mimeType = mimeType;
    }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getExtractedText() { return extractedText; }
    public void setExtractedText(String extractedText) { this.extractedText = extractedText; }
    public long getFileSize() { return fileSize; }
    public void setFileSize(long fileSize) { this.fileSize = fileSize; }
    public String getMimeType() { return mimeType; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }
}
