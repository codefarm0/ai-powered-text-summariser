package in.codefarm.ai.text.summariser.controller;

import in.codefarm.ai.text.summariser.dto.response.ApiResponse;
import in.codefarm.ai.text.summariser.dto.response.ModelStatusResponse;
import in.codefarm.ai.text.summariser.service.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/models")
public class ModelController {

    private final AiService aiService;

    public ModelController(AiService aiService) {
        this.aiService = aiService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<String>>> getAvailableModels() {
        return ResponseEntity.ok(ApiResponse.ok(aiService.getAvailableModels()));
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<ModelStatusResponse>> getModelStatus() {
        String defaultModel = aiService.getAvailableModels().getFirst();
        boolean available = aiService.isModelAvailable(defaultModel);
        ModelStatusResponse status = new ModelStatusResponse(
                defaultModel, available ? "ONLINE" : "UNAVAILABLE");
        return ResponseEntity.ok(ApiResponse.ok(status));
    }
}
