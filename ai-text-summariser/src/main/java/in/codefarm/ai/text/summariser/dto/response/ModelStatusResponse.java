package in.codefarm.ai.text.summariser.dto.response;

public class ModelStatusResponse {

    private String model;
    private String status;

    public ModelStatusResponse(String model, String status) {
        this.model = model;
        this.status = status;
    }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
