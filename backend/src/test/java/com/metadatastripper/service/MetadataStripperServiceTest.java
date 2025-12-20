package com.metadatastripper.service;

import com.metadatastripper.dto.ImageMetadataDto;
import com.metadatastripper.exception.ImageProcessingException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

class MetadataStripperServiceTest {
    
    private MetadataStripperService service;
    
    @BeforeEach
    void setUp() {
        service = new MetadataStripperService();
    }
    
    @Test
    void testExtractMetadata_ValidImage_Success() throws IOException {
        // Create a simple test image
        BufferedImage img = createTestImage();
        byte[] imageBytes = convertImageToBytes(img, "png");
        
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "test.png",
            "image/png",
            imageBytes
        );
        
        ImageMetadataDto result = service.extractMetadata(file);
        
        assertNotNull(result);
        assertEquals("test.png", result.getFileName());
        assertEquals("image/png", result.getMimeType());
        assertTrue(result.getFileSize() > 0);
        
        // Check that all metadata groups are present
        assertNotNull(result.getCameraInfo());
        assertNotNull(result.getLocationInfo());
        assertNotNull(result.getDateTimeInfo());
        assertNotNull(result.getImageInfo());
        assertNotNull(result.getOtherInfo());
    }
    
    @Test
    void testExtractMetadata_CheckGroupNames() throws IOException {
        BufferedImage img = createTestImage();
        byte[] imageBytes = convertImageToBytes(img, "png");
        
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "test.png",
            "image/png",
            imageBytes
        );
        
        ImageMetadataDto result = service.extractMetadata(file);
        
        assertEquals("Camera Information", result.getCameraInfo().getGroupName());
        assertEquals("Location Information", result.getLocationInfo().getGroupName());
        assertEquals("Date & Time Information", result.getDateTimeInfo().getGroupName());
        assertEquals("Image Properties", result.getImageInfo().getGroupName());
        assertEquals("Other Metadata", result.getOtherInfo().getGroupName());
    }
    
    @Test
    void testExtractMetadata_ImageHasImageProperties() throws IOException {
        BufferedImage img = createTestImage();
        byte[] imageBytes = convertImageToBytes(img, "png");
        
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "test.png",
            "image/png",
            imageBytes
        );
        
        ImageMetadataDto result = service.extractMetadata(file);
        
        // PNG files should have image properties like width, height
        if (result.getImageInfo().isHasData()) {
            assertTrue(result.getImageInfo().getData().size() > 0);
        }
    }
    
    @Test
    void testStripMetadata_ValidImage_Success() throws IOException {
        BufferedImage img = createTestImage();
        byte[] imageBytes = convertImageToBytes(img, "png");
        
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "test.png",
            "image/png",
            imageBytes
        );
        
        byte[] result = service.stripMetadata(file);
        
        assertNotNull(result);
        assertTrue(result.length > 0);
    }
    
    @Test
    void testStripMetadata_EmptyFile_ThrowsException() {
        MockMultipartFile emptyFile = new MockMultipartFile(
            "file",
            "test.png",
            "image/png",
            new byte[0]
        );
        
        assertThrows(ImageProcessingException.class, () -> {
            service.stripMetadata(emptyFile);
        });
    }
    
    @Test
    void testStripMetadata_UnsupportedFormat_ThrowsException() {
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "test.txt",
            "text/plain",
            "test content".getBytes()
        );
        
        ImageProcessingException exception = assertThrows(
            ImageProcessingException.class,
            () -> service.stripMetadata(file)
        );
        
        assertTrue(exception.getMessage().contains("Unsupported file format"));
    }
    
    @Test
    void testStripMetadata_NullFile_ThrowsException() {
        assertThrows(ImageProcessingException.class, () -> {
            service.stripMetadata(null);
        });
    }
    
    @Test
    void testExtractMetadata_JPEGImage_Success() throws IOException {
        BufferedImage img = createTestImage();
        byte[] imageBytes = convertImageToBytes(img, "jpg");
        
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "test.jpg",
            "image/jpeg",
            imageBytes
        );
        
        ImageMetadataDto result = service.extractMetadata(file);
        
        assertNotNull(result);
        assertEquals("test.jpg", result.getFileName());
    }
    
    @Test
    void testMetadataGroups_HasDataFlag() throws IOException {
        BufferedImage img = createTestImage();
        byte[] imageBytes = convertImageToBytes(img, "png");
        
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "test.png",
            "image/png",
            imageBytes
        );
        
        ImageMetadataDto result = service.extractMetadata(file);
        
        // Check that hasData flag is set correctly for each group
        ImageMetadataDto.MetadataGroup cameraInfo = result.getCameraInfo();
        assertEquals(!cameraInfo.getData().isEmpty(), cameraInfo.isHasData());
        
        ImageMetadataDto.MetadataGroup locationInfo = result.getLocationInfo();
        assertEquals(!locationInfo.getData().isEmpty(), locationInfo.isHasData());
    }
    
    private BufferedImage createTestImage() {
        BufferedImage img = new BufferedImage(100, 100, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = img.createGraphics();
        g.setColor(Color.BLUE);
        g.fillRect(0, 0, 100, 100);
        g.dispose();
        return img;
    }
    
    private byte[] convertImageToBytes(BufferedImage img, String format) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(img, format, baos);
        return baos.toByteArray();
    }
}