package com.metadatastripper.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageMetadataDto {
    private String fileName;
    private long fileSize;
    private String mimeType;
    private Map<String, String> exifData;
    private boolean hasMetadata;
    
    // Grouped metadata
    private MetadataGroup cameraInfo;
    private MetadataGroup locationInfo;
    private MetadataGroup dateTimeInfo;
    private MetadataGroup imageInfo;
    private MetadataGroup otherInfo;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MetadataGroup {
        private String groupName;
        private Map<String, String> data;
        private boolean hasData;
    }
}