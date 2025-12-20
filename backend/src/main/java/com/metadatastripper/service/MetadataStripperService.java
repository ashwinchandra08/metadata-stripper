package com.metadatastripper.service;

import com.drew.imaging.ImageMetadataReader;
import com.drew.imaging.ImageProcessingException;
import com.drew.metadata.Directory;
import com.drew.metadata.Metadata;
import com.drew.metadata.Tag;
import com.metadatastripper.dto.ImageMetadataDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class MetadataStripperService {
    
    private static final String[] SUPPORTED_FORMATS = {"jpg", "jpeg", "png", "gif", "bmp"};
    
    // Keywords for categorizing metadata
    private static final Set<String> CAMERA_KEYWORDS = new HashSet<>(Arrays.asList(
        "camera", "make", "model", "lens", "focal", "aperture", "iso", "shutter", 
        "exposure", "flash", "metering", "white balance", "f-number", "f-stop",
        "manufacturer", "brightness", "contrast", "saturation", "sharpness"
    ));
    
    private static final Set<String> LOCATION_KEYWORDS = new HashSet<>(Arrays.asList(
        "gps", "latitude", "longitude", "altitude", "location", "coordinates",
        "geo", "position", "place"
    ));
    
    private static final Set<String> DATETIME_KEYWORDS = new HashSet<>(Arrays.asList(
        "date", "time", "timestamp", "created", "modified", "digitized", 
        "datetime", "original", "offset"
    ));
    
    private static final Set<String> IMAGE_KEYWORDS = new HashSet<>(Arrays.asList(
        "width", "height", "resolution", "dimension", "dpi", "orientation",
        "color space", "bits per sample", "compression", "photometric",
        "pixel", "image", "x resolution", "y resolution", "unit"
    ));
    
    /**
     * Extracts and groups metadata from an image file
     */
    public ImageMetadataDto extractMetadata(MultipartFile file) {
        validateFile(file);
        
        try {
            Metadata metadata = ImageMetadataReader.readMetadata(file.getInputStream());
            Map<String, String> allExifData = new HashMap<>();
            
            // Collect all metadata
            for (Directory directory : metadata.getDirectories()) {
                for (Tag tag : directory.getTags()) {
                    String key = directory.getName() + " - " + tag.getTagName();
                    allExifData.put(key, tag.getDescription());
                }
            }
            
            // Group metadata
            Map<String, String> cameraData = new LinkedHashMap<>();
            Map<String, String> locationData = new LinkedHashMap<>();
            Map<String, String> dateTimeData = new LinkedHashMap<>();
            Map<String, String> imageData = new LinkedHashMap<>();
            Map<String, String> otherData = new LinkedHashMap<>();
            
            for (Map.Entry<String, String> entry : allExifData.entrySet()) {
                String key = entry.getKey();
                String value = entry.getValue();
                String lowerKey = key.toLowerCase();
                
                if (containsAny(lowerKey, CAMERA_KEYWORDS)) {
                    cameraData.put(key, value);
                } else if (containsAny(lowerKey, LOCATION_KEYWORDS)) {
                    locationData.put(key, value);
                } else if (containsAny(lowerKey, DATETIME_KEYWORDS)) {
                    dateTimeData.put(key, value);
                } else if (containsAny(lowerKey, IMAGE_KEYWORDS)) {
                    imageData.put(key, value);
                } else {
                    otherData.put(key, value);
                }
            }
            
            return ImageMetadataDto.builder()
                    .fileName(file.getOriginalFilename())
                    .fileSize(file.getSize())
                    .mimeType(file.getContentType())
                    .exifData(allExifData)
                    .hasMetadata(!allExifData.isEmpty())
                    .cameraInfo(createMetadataGroup("Camera Information", cameraData))
                    .locationInfo(createMetadataGroup("Location Information", locationData))
                    .dateTimeInfo(createMetadataGroup("Date & Time Information", dateTimeData))
                    .imageInfo(createMetadataGroup("Image Properties", imageData))
                    .otherInfo(createMetadataGroup("Other Metadata", otherData))
                    .build();
                    
        } catch (ImageProcessingException | IOException e) {
            log.error("Error extracting metadata from file: {}", file.getOriginalFilename(), e);
            throw new com.metadatastripper.exception.ImageProcessingException(
                "Failed to extract metadata from image", e
            );
        }
    }
    
    /**
     * Strips all metadata from an image and returns the cleaned image bytes
     */
    public byte[] stripMetadata(MultipartFile file) {
        validateFile(file);
        
        try {
            // Read the image
            BufferedImage image = ImageIO.read(file.getInputStream());
            
            if (image == null) {
                throw new com.metadatastripper.exception.ImageProcessingException(
                    "Unable to read image file"
                );
            }
            
            // Get the format
            String format = getImageFormat(file.getOriginalFilename());
            
            // Write to output stream without metadata
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, format, baos);
            
            log.info("Successfully stripped metadata from: {}", file.getOriginalFilename());
            return baos.toByteArray();
            
        } catch (IOException e) {
            log.error("Error stripping metadata from file: {}", file.getOriginalFilename(), e);
            throw new com.metadatastripper.exception.ImageProcessingException(
                "Failed to strip metadata from image", e
            );
        }
    }
    
    /**
     * Creates a metadata group
     */
    private ImageMetadataDto.MetadataGroup createMetadataGroup(String groupName, Map<String, String> data) {
        return ImageMetadataDto.MetadataGroup.builder()
                .groupName(groupName)
                .data(data)
                .hasData(!data.isEmpty())
                .build();
    }
    
    /**
     * Checks if the text contains any of the keywords
     */
    private boolean containsAny(String text, Set<String> keywords) {
        return keywords.stream().anyMatch(text::contains);
    }
    
    /**
     * Validates the uploaded file
     */
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new com.metadatastripper.exception.ImageProcessingException(
                "File cannot be empty"
            );
        }
        
        String filename = file.getOriginalFilename();
        if (filename == null || !isSupportedFormat(filename)) {
            throw new com.metadatastripper.exception.ImageProcessingException(
                "Unsupported file format. Supported formats: jpg, jpeg, png, gif, bmp"
            );
        }
    }
    
    /**
     * Checks if the file format is supported
     */
    private boolean isSupportedFormat(String filename) {
        String extension = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
        for (String format : SUPPORTED_FORMATS) {
            if (format.equals(extension)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Extracts the image format from filename
     */
    private String getImageFormat(String filename) {
        String extension = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
        return extension.equals("jpg") ? "jpeg" : extension;
    }
}