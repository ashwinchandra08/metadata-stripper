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

        <h1>Privacy Policy</h1>
        <section className="privacy-section">
          <h2>Introduction and Scope</h2>
          <p>This Privacy Policy ("Policy") governs the collection, processing, and handling of data by the Metadata Stripper application ("Service"). This Policy describes our commitment to protecting user privacy and details the technical measures implemented to ensure data security. By using this Service, you acknowledge and agree to the practices described herein.</p>
        </section>

        <section className="privacy-section">
          <h2>Image Processing Methodology</h2>
          <h3>Production Environment</h3>
          <p>In the production environment, image processing occurs according to the following protocol:</p>
          <ol>
            <li>Image files are transmitted from the user's client device to the server infrastructure via encrypted HTTPS protocol;</li>
            <li>Images are loaded into volatile server memory (RAM) for temporary processing purposes;</li>
            <li>Processed images, with metadata removed, are transmitted back to the user's client device;</li>
            <li>Both original and processed image data are immediately expunged from server memory upon completion of the HTTP response cycle.</li>
          </ol>
        </section>

        <section className="privacy-section">
          <h2>Data Retention and Storage Policies</h2>
          <p>The Service implements a zero-retention policy with respect to user-uploaded content:</p>
          <ul className="feature-list">
            <li><strong>Zero Persistent Storage:</strong> No image files are written to disk storage, database systems, or any form of persistent storage media;</li>
            <li><strong>No Activity Logging:</strong> Image content and metadata are not recorded in system logs or audit trails;</li>
            <li><strong>Volatile Memory Only:</strong> Image data exists exclusively in volatile memory (RAM) during active processing operations;</li>
            <li><strong>Automated Disposal:</strong> All image data structures are subject to immediate garbage collection upon completion of the HTTP transaction.</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>Information Not Collected</h2>
          <p>The Service explicitly does not collect, store, or process the following categories of information:</p>
          <ul className="no-collect-list">
            <li>User-uploaded image files (neither original nor processed versions);</li>
            <li>Extracted image metadata, including but not limited to EXIF, IPTC, and XMP data;</li>
            <li>Tracking cookies or persistent identifiers;</li>
            <li>Analytics data pertaining to image content or characteristics;</li>
            <li>User account information or authentication credentials;</li>
            <li>IP addresses or network identifiers associated with image processing requests.</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>Technical Implementation Details</h2>
          
          <h3>Server-Side Processing Architecture</h3>
          <p>The backend processing methodology employs the following technical approach:</p>
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

          <h3>Metadata Handling Procedures</h3>
          <p><strong>Metadata Viewing Functionality:</strong></p>
          <ul>
            <li>EXIF metadata is extracted from uploaded images and transmitted to the client browser for display purposes only;</li>
            <li>Extracted metadata is not persisted on server infrastructure;</li>
            <li>Metadata exists in server memory only for the duration of the HTTP request-response cycle.</li>
          </ul>

          <p><strong>Metadata Removal Functionality:</strong></p>
          <ul>
            <li>Images are reconstructed without EXIF, IPTC, or XMP metadata segments;</li>
            <li>Original metadata is discarded and not retained;</li>
            <li>Processed images contain no geolocation data, device information, or temporal metadata.</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>Third-Party Services and Integrations</h2>
          <p>This Service operates independently and does not integrate with or utilize the following categories of third-party services:</p>
          <ul className="no-collect-list">
            <li>Cloud storage providers (including but not limited to Amazon S3, Google Cloud Storage, Microsoft Azure Storage);</li>
            <li>Analytics and tracking services (including but not limited to Google Analytics, Adobe Analytics);</li>
            <li>Content delivery networks that implement user tracking mechanisms;</li>
            <li>External APIs or services for image processing operations.</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>Policy Modifications and Updates</h2>
          <p>We reserve the right to modify this Privacy Policy at any time. Material changes to our data handling practices will be reflected through updates to this document. The "Effective Date" at the beginning of this Policy indicates the date of the most recent revision. Users are encouraged to review this Policy periodically to remain informed of any changes.</p>
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