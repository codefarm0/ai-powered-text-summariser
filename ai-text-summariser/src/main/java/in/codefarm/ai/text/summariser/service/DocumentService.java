package in.codefarm.ai.text.summariser.service;

import in.codefarm.ai.text.summariser.dto.response.DocumentResponse;
import in.codefarm.ai.text.summariser.entity.DocumentEntity;
import in.codefarm.ai.text.summariser.entity.ProjectEntity;
import in.codefarm.ai.text.summariser.exception.DocumentExtractionException;
import in.codefarm.ai.text.summariser.mapper.EntityMapper;
import in.codefarm.ai.text.summariser.repository.DocumentRepository;
import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Set;

@Service
public class DocumentService {

    private static final Logger log = LoggerFactory.getLogger(DocumentService.class);

    private static final Set<String> SUPPORTED_MIME_TYPES = Set.of(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
            "text/plain",
            "text/html",
            "application/rtf",
            "application/vnd.oasis.opendocument.text"
    );

    private final Tika tika;
    private final FileStorageService fileStorageService;
    private final DocumentRepository documentRepository;
    private final EntityMapper mapper;

    public DocumentService(FileStorageService fileStorageService,
                           DocumentRepository documentRepository,
                           EntityMapper mapper) {
        this.tika = new Tika();
        this.fileStorageService = fileStorageService;
        this.documentRepository = documentRepository;
        this.mapper = mapper;
    }

    @Transactional
    public DocumentResponse extractAndSave(MultipartFile file, ProjectEntity project) {
        String originalName = file.getOriginalFilename();
        String contentType = file.getContentType();
        long size = file.getSize();

        log.info("Processing document: name={}, type={}, size={}", originalName, contentType, size);

        if (originalName == null || originalName.isBlank()) {
            throw new DocumentExtractionException("File name is required");
        }

        if (contentType != null && !SUPPORTED_MIME_TYPES.contains(contentType)) {
            log.warn("Unsupported file type: {} for file: {}", contentType, originalName);
            throw new DocumentExtractionException("Unsupported file type: " + contentType
                    + ". Supported types: PDF, DOCX, DOC, TXT, HTML, RTF, ODT");
        }

        String extractedText;
        try (InputStream inputStream = file.getInputStream()) {
            extractedText = tika.parseToString(inputStream);
        } catch (IOException e) {
            throw new DocumentExtractionException("Failed to read uploaded file: " + e.getMessage(), e);
        } catch (TikaException e) {
            throw new DocumentExtractionException("Failed to extract text from file: " + e.getMessage(), e);
        }

        if (extractedText == null || extractedText.isBlank()) {
            throw new DocumentExtractionException("No text could be extracted from the file. The file may be empty or contain only images.");
        }

        String filePath = fileStorageService.storeFile(file);
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        DocumentEntity entity = new DocumentEntity();
        entity.setProject(project);
        entity.setFileName(originalName);
        entity.setFileSize(size);
        entity.setMimeType(contentType);
        entity.setFilePath(filePath);
        entity.setExtractedText(extractedText.trim());
        entity = documentRepository.save(entity);

        return mapper.toDocumentResponse(entity);
    }
}
