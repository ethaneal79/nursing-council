package com.msnc.nursingcouncil.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/certificates")
public class CertificateController {

    @GetMapping("/{fileName}")
    public ResponseEntity<Resource> downloadCertificate(
            @PathVariable String fileName
    ) throws Exception {

        Path path = Paths.get("certificates")
                .resolve(fileName);

        Resource resource = new UrlResource(path.toUri());

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + fileName + "\""
                )
                .body(resource);
    }
}