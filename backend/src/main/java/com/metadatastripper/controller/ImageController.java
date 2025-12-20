package com.metadatastripper.controller;

import com.metadatastripper.dto.ImageMetadataDto;
import com.metadatastripper.service.ImageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/images")
@RequiredArgsConstructor
@Slf4j
public class ImageController {
    
    private final ImageService imageService;
    
    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Metadata Stripper API is running");
    }
    
    /**
     * Extract and view metadata from an image
     */
    @PostMapping(value = "/metadata", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImageMetadataDto> extractMetadata(
            @RequestParam("file") MultipartFile file) {
        log.info("Received request to extract metadata from: {}", file.getOriginalFilename());
        ImageMetadataDto metadata = imageService.getImageMetadata(file);
        return ResponseEntity.ok(metadata);
    }
    
    /**
     * Strip metadata from an image and return the cleaned image
     */
    @PostMapping(value = "/strip", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<byte[]> stripMetadata(
            @RequestParam("file") MultipartFile file) {
        log.info("Received request to strip metadata from: {}", file.getOriginalFilename());
        
        byte[] cleanedImage = imageService.processImage(file);
        
        String originalFilename = file.getOriginalFilename();
        String cleanedFilename = "cleaned_" + originalFilename;
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(file.getContentType()));
        headers.setContentDispositionFormData("attachment", cleanedFilename);
        headers.setContentLength(cleanedImage.length);
        
        return new ResponseEntity<>(cleanedImage, headers, HttpStatus.OK);
    }
}