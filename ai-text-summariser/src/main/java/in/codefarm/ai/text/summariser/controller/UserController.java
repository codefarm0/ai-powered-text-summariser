package in.codefarm.ai.text.summariser.controller;

import in.codefarm.ai.text.summariser.dto.request.UpdatePreferencesRequest;
import in.codefarm.ai.text.summariser.dto.response.ApiResponse;
import in.codefarm.ai.text.summariser.dto.response.UserResponse;
import in.codefarm.ai.text.summariser.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/guest")
    public ResponseEntity<ApiResponse<UserResponse>> createGuestUser() {
        UserResponse user = userService.createGuestUser();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(user));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getUserProfile(
            @RequestHeader("X-User-Id") String publicId) {
        UserResponse user = userService.getUserProfile(publicId);
        return ResponseEntity.ok(ApiResponse.ok(user));
    }

    @PutMapping("/preferences")
    public ResponseEntity<ApiResponse<UserResponse>> updatePreferences(
            @RequestHeader("X-User-Id") String publicId,
            @Valid @RequestBody UpdatePreferencesRequest request) {
        UserResponse user = userService.updatePreferences(publicId, request);
        return ResponseEntity.ok(ApiResponse.ok(user));
    }
}
