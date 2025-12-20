package com.metadatastripper.service;

import com.metadatastripper.dto.ImageMetadataDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImageService {
    
    private final MetadataStripperService metadataStripperService;
    
    /**
     * Orchestrates the metadata extraction process
     */
    public ImageMetadataDto getImageMetadata(MultipartFile file) {
        log.info("Extracting metadata from file: {}", file.getOriginalFilename());
        return metadataStripperService.extractMetadata(file);
    }
    
    /**
     * Orchestrates the metadata stripping process
     */
    public byte[] processImage(MultipartFile file) {
        log.info("Processing image to strip metadata: {}", file.getOriginalFilename());
        return metadataStripperService.stripMetadata(file);
    }
}