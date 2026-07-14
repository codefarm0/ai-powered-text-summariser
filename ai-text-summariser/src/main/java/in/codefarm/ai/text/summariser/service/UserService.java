package in.codefarm.ai.text.summariser.service;

import in.codefarm.ai.text.summariser.dto.request.UpdatePreferencesRequest;
import in.codefarm.ai.text.summariser.dto.response.UserResponse;
import in.codefarm.ai.text.summariser.entity.UserEntity;
import in.codefarm.ai.text.summariser.exception.UserNotFoundException;
import in.codefarm.ai.text.summariser.mapper.EntityMapper;
import in.codefarm.ai.text.summariser.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final EntityMapper mapper;

    public UserService(UserRepository userRepository, EntityMapper mapper) {
        this.userRepository = userRepository;
        this.mapper = mapper;
    }

    @Transactional
    public UserResponse createGuestUser() {
        UserEntity entity = new UserEntity();
        entity.setPublicId(UUID.randomUUID().toString());
        entity.setDisplayName("Guest-" + (1000 + (int)(Math.random() * 9000)));
        entity.setGuestUser(true);
        entity.setPreferredModel("mistral");
        entity.setPreferredSummaryType("EXECUTIVE");
        entity = userRepository.save(entity);
        return mapper.toUserResponse(entity);
    }

    public UserResponse getUserProfile(String publicId) {
        UserEntity entity = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + publicId));
        entity.setLastActiveAt(java.time.LocalDateTime.now());
        userRepository.save(entity);
        return mapper.toUserResponse(entity);
    }

    @Transactional
    public UserResponse updatePreferences(String publicId, UpdatePreferencesRequest request) {
        UserEntity entity = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + publicId));
        if (request.getPreferredModel() != null) {
            entity.setPreferredModel(request.getPreferredModel());
        }
        if (request.getPreferredSummaryType() != null) {
            entity.setPreferredSummaryType(request.getPreferredSummaryType());
        }
        entity = userRepository.save(entity);
        return mapper.toUserResponse(entity);
    }

    public UserEntity getUserEntity(String publicId) {
        return userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + publicId));
    }
}
