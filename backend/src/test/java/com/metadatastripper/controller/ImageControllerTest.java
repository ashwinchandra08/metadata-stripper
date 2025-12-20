package com.metadatastripper.controller;

import com.metadatastripper.dto.ImageMetadataDto;
import com.metadatastripper.service.ImageService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ImageController.class)
class ImageControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private ImageService imageService;
    
    @Test
    void testHealthCheck() throws Exception {
        mockMvc.perform(get("/images/health"))
                .andExpect(status().isOk())
                .andExpect(content().string("Metadata Stripper API is running"));
    }
    
    @Test
    void testExtractMetadata_Success() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "test.jpg",
            MediaType.IMAGE_JPEG_VALUE,
            "test image content".getBytes()
        );
        
        Map<String, String> exifData = new HashMap<>();
        exifData.put("Camera Model", "Canon EOS 5D");
        exifData.put("GPS Location", "37.7749° N, 122.4194° W");
        
        ImageMetadataDto mockMetadata = ImageMetadataDto.builder()
                .fileName("test.jpg")
                .fileSize(1024L)
                .mimeType(MediaType.IMAGE_JPEG_VALUE)
                .exifData(exifData)
                .hasMetadata(true)
                .build();
        
        when(imageService.getImageMetadata(any())).thenReturn(mockMetadata);
        
        mockMvc.perform(multipart("/images/metadata")
                        .file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fileName").value("test.jpg"))
                .andExpect(jsonPath("$.hasMetadata").value(true));
    }
    
    @Test
    void testStripMetadata_Success() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "test.jpg",
            MediaType.IMAGE_JPEG_VALUE,
            "test image content".getBytes()
        );
        
        byte[] cleanedImage = "cleaned image bytes".getBytes();
        
        when(imageService.processImage(any())).thenReturn(cleanedImage);
        
        mockMvc.perform(multipart("/images/strip")
                        .file(file))
                .andExpect(status().isOk())
                .andExpect(header().exists("Content-Disposition"))
                .andExpect(content().bytes(cleanedImage));
    }
}