package com.metadatastripper.service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class RateLimitService {
    
    // Store buckets per IP address
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
    
    /**
     * Rate limit configuration:
     * - 10 requests per minute per IP
     * - Refills at 10 tokens per minute
     */
    private static final int REQUESTS_PER_MINUTE = 10;
    
    /**
     * Get or create a bucket for the given IP address
     */
    public Bucket resolveBucket(String ipAddress) {
        return buckets.computeIfAbsent(ipAddress, this::createNewBucket);
    }
    
    /**
     * Create a new bucket with rate limiting rules
     */
    private Bucket createNewBucket(String ipAddress) {
        log.info("Creating new rate limit bucket for IP: {}", ipAddress);
        
        // Define bandwidth: 10 requests per minute
        Bandwidth limit = Bandwidth.classic(
            REQUESTS_PER_MINUTE, 
            Refill.intervally(REQUESTS_PER_MINUTE, Duration.ofMinutes(1))
        );
        
        return Bucket.builder()
            .addLimit(limit)
            .build();
    }
    
    /**
     * Check if request should be allowed
     */
    public boolean allowRequest(String ipAddress) {
        Bucket bucket = resolveBucket(ipAddress);
        boolean allowed = bucket.tryConsume(1);
        
        if (!allowed) {
            log.warn("Rate limit exceeded for IP: {}", ipAddress);
        }
        
        return allowed;
    }
    
    /**
     * Get remaining tokens for an IP
     */
    public long getRemainingTokens(String ipAddress) {
        Bucket bucket = resolveBucket(ipAddress);
        return bucket.getAvailableTokens();
    }
    
    /**
     * Clean up old buckets (optional, for memory management)
     * Call this periodically if needed
     */
    public void cleanupOldBuckets() {
        // In production, implement TTL-based cleanup
        // For now, buckets stay in memory
        log.info("Current bucket count: {}", buckets.size());
    }
}