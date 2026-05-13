package com.msnc.nursingcouncil.util;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "jpg", "jpeg", "png");
    private static final long MAX_SIZE = 5 * 1024 * 1024L; // 5 MB

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    /**
     * Stores a multipart file under uploadDir/applicationRef/ and returns the relative path.
     */
    public String store(MultipartFile file, String applicationRef) throws IOException {
        validateFile(file);

        String ext      = FilenameUtils.getExtension(file.getOriginalFilename()).toLowerCase();
        String safeName = UUID.randomUUID() + "." + ext;
        Path   dir      = Paths.get(uploadDir, applicationRef);
        Files.createDirectories(dir);

        Path dest = dir.resolve(safeName);
        file.transferTo(dest);

        log.info("Stored document for {} → {}", applicationRef, dest);
        return applicationRef + "/" + safeName;
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        if (file.getSize() > MAX_SIZE) {
            throw new IllegalArgumentException("File exceeds maximum allowed size of 5 MB");
        }
        String ext = FilenameUtils.getExtension(file.getOriginalFilename());
        if (ext == null || !ALLOWED_EXTENSIONS.contains(ext.toLowerCase())) {
            throw new IllegalArgumentException("Only PDF, JPG and PNG files are allowed");
        }
    }
}
