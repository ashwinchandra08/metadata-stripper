import React from 'react';
import { Link } from 'react-router-dom';
import './Privacy.css';

const Privacy = () => {
  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <Link to="/" className="back-button">
          ← Back to Home
        </Link>

        <h1>Privacy Policy - Metadata Stripper</h1>

        <section className="privacy-section">
          <h2>Our Commitment to Privacy</h2>
          <p>This application is designed with privacy as a core principle. We believe in transparency about how your data is handled.</p>
        </section>

        <section className="privacy-section">
          <h2>How Your Images Are Processed</h2>
          <h3>Production Deployment</h3>
          <p>If you deploy this application to a remote server:</p>
          <ol>
            <li>Images are transmitted from your browser to the remote server over HTTPS</li>
            <li>Images are processed in server memory (not saved to disk)</li>
            <li>Cleaned images are returned to your browser</li>
            <li>Original and processed images are discarded immediately after transfer</li>
          </ol>
        </section>

        <section className="privacy-section">
          <h2>Data Retention</h2>
          <ul className="feature-list">
            <li><strong>Zero Storage:</strong> No images are stored on disk or in databases</li>
            <li><strong>No Logs:</strong> Image data is not logged</li>
            <li><strong>Memory Only:</strong> Images exist only in RAM during active processing</li>
            <li><strong>Immediate Disposal:</strong> All image data is garbage collected after the HTTP response completes</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>What We DO NOT Collect</h2>
          <ul className="no-collect-list">
            <li>❌ Your images are not stored</li>
            <li>❌ Image metadata is not stored</li>
            <li>❌ No tracking cookies</li>
            <li>❌ No analytics on image content</li>
            <li>❌ No user accounts or authentication</li>
            <li>❌ No IP address logging related to image processing</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>Technical Details</h2>
          
          <h3>Backend Processing</h3>
          <pre className="code-block">
            <code>{`public byte[] stripMetadata(MultipartFile file) {
    // Read image into memory
    BufferedImage image = ImageIO.read(file.getInputStream());
    
    // Create clean version
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    ImageIO.write(image, format, baos);
    
    return baos.toByteArray();
    // After this method returns and response is sent,
    // both 'image' and 'baos' are garbage collected
}`}</code>
          </pre>

          <h3>What Happens to EXIF Data</h3>
          <p><strong>When you use "View Metadata":</strong></p>
          <ul>
            <li>EXIF data is extracted and sent to your browser for display</li>
            <li>This data is NOT stored on the server</li>
            <li>It exists only for the duration of the HTTP request</li>
          </ul>

          <p><strong>When you use "Strip & Download":</strong></p>
          <ul>
            <li>The image is rewritten without any EXIF segments</li>
            <li>Original EXIF data is discarded</li>
            <li>Clean image contains no location, camera, or timestamp information</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>Third-Party Services</h2>
          <p>This application does NOT use:</p>
          <ul className="no-collect-list">
            <li>❌ Cloud storage (AWS S3, Google Cloud Storage, etc.)</li>
            <li>❌ Analytics services (Google Analytics, etc.)</li>
            <li>❌ CDNs that track users</li>
            <li>❌ Third-party APIs for image processing</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>Changes to This Policy</h2>
          <p>We will update this document if our data handling practices change.</p>
        </section>

        <hr className="divider" />

        <div className="footer-note">
          <p><strong>Last Updated:</strong> December 2025</p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;