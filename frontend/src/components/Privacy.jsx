import React from 'react';
import { Link } from 'react-router-dom';
import './Privacy.css';

const Privacy = () => {
  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <Link to="/" className="back-link">
          ← Back
        </Link>

        <h1>Privacy Policy</h1>

        <section>
          <h2>Overview</h2>
          <p>
            Metadata Stripper processes your images entirely in memory. We don't store, log, or retain any images or metadata you upload. Everything is deleted immediately after processing.
          </p>
        </section>

        <section>
          <h2>How It Works</h2>
          <p>
            When you upload an image, it's transmitted over HTTPS to our server, processed in RAM to remove metadata, and sent back to you. Both the original and processed versions are immediately cleared from memory once the response completes.
          </p>
        </section>

        <section>
          <h2>What We Don't Collect</h2>
          <ul>
            <li>Your images (original or processed)</li>
            <li>Image metadata (EXIF, GPS, device info)</li>
            <li>Cookies or tracking identifiers</li>
            <li>User accounts or login information</li>
            <li>IP addresses (except briefly for rate limiting—not logged)</li>
          </ul>
        </section>

        <section>
          <h2>Technical Details</h2>
          <div className="technical-note">
            <pre><code>{`public byte[] stripMetadata(MultipartFile file) {
    validateFile(file);
    
    // Read the image
    BufferedImage image = ImageIO.read(file.getInputStream());
    
    // Get the format
    String format = getImageFormat(file.getOriginalFilename());
    
    // Write to output stream without metadata
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    ImageIO.write(image, format, baos);
    
    return baos.toByteArray();
    // After return, 'image' and 'baos' are garbage collected
}`}</code></pre>
          </div>
          <p>
            No disk storage, databases, or cloud services are used. The entire process happens in volatile memory during your request.
          </p>
        </section>

        <section>
          <h2>Third Parties</h2>
          <p>
            We don't use analytics services, cloud storage providers, or any external APIs. Your images never leave our server infrastructure.
          </p>
        </section>

        <section>
          <h2>Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. Any changes will be reflected here with an updated date at the top.
          </p>
        </section>

        <div className="footer">
          <p>Last updated: December 2025</p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;