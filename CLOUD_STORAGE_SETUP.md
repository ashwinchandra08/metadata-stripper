# Cloud Storage Integration Setup Guide

This guide explains how to set up Google Drive and Dropbox integration for your image uploader application.

## 🔑 Getting API Keys

### Google Drive Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/

2. **Create a new project** (or select an existing one)

3. **Enable Google Drive API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

4. **Enable Google Picker API**:
   - Search for "Google Picker API"
   - Click "Enable"

5. **Create OAuth 2.0 credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Configure OAuth consent screen if prompted
   - Application type: "Web application"
   - Add authorized JavaScript origins:
     - `http://localhost:5173` (for development)
     - `https://yourdomain.com` (for production)
   - Copy the **Client ID**

6. **Create API Key**:
   - Click "Create Credentials" > "API Key"
   - Copy the **API Key**
   - Restrict the key to Google Drive API and Google Picker API

7. **Update the code**:
   - Open `frontend/src/services/cloudStorageService.js`
   - Replace `YOUR_GOOGLE_API_KEY` with your API Key
   - Replace `YOUR_GOOGLE_CLIENT_ID` with your OAuth 2.0 Client ID

### Dropbox Setup

1. **Go to Dropbox App Console**: https://www.dropbox.com/developers/apps

2. **Create a new app**:
   - Click "Create app"
   - Choose "Scoped access"
   - Choose "Full Dropbox" or "App folder" (Full Dropbox recommended)
   - Give your app a name
   - Click "Create app"

3. **Configure permissions**:
   - Go to the "Permissions" tab
   - Enable `files.content.read` permission
   - Click "Submit"

4. **Get your App key**:
   - Go to the "Settings" tab
   - Copy the **App key**

5. **Configure allowed domains** (optional, for production):
   - In "Chooser / Saver / Embedder domains"
   - Add your domain (e.g., `yourdomain.com`)

6. **Update the code**:
   - Open `frontend/src/services/cloudStorageService.js`
   - Replace `YOUR_DROPBOX_APP_KEY` with your App key

## 📝 Configuration

Edit the file `frontend/src/services/cloudStorageService.js`:

```javascript
const GOOGLE_API_KEY = 'AIzaSyA...'; // Your Google API Key
const GOOGLE_CLIENT_ID = '123456789-abc.apps.googleusercontent.com'; // Your Google Client ID
const DROPBOX_APP_KEY = 'abc123xyz'; // Your Dropbox App Key
```

## 🧪 Testing

### Development Testing

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:5173`

3. Click "Import from Cloud" button

4. Try selecting files from both Google Drive and Dropbox

### Common Issues

**Google Drive:**
- **Error: "Access blocked"** - Make sure you added `http://localhost:5173` to authorized JavaScript origins
- **Error: "Invalid API key"** - Check that your API key is correct and has the right API restrictions
- **Error: "Permission denied"** - Ensure Google Drive API and Picker API are enabled

**Dropbox:**
- **Chooser doesn't load** - Check that your App key is correct
- **Can't select files** - Verify that `files.content.read` permission is enabled
- **CORS errors** - Add your domain to allowed domains in Dropbox settings

## 🔒 Security Best Practices

### For Production:

1. **Use Environment Variables**:
   Create a `.env` file:
   ```env
   VITE_GOOGLE_API_KEY=your_api_key_here
   VITE_GOOGLE_CLIENT_ID=your_client_id_here
   VITE_DROPBOX_APP_KEY=your_app_key_here
   ```

   Update `cloudStorageService.js`:
   ```javascript
   const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
   const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
   const DROPBOX_APP_KEY = import.meta.env.VITE_DROPBOX_APP_KEY;
   ```

2. **Restrict API Keys**:
   - Google: Add HTTP referrer restrictions
   - Dropbox: Add allowed domains

3. **Update authorized origins**:
   - Add your production domain to Google OAuth settings
   - Add your production domain to Dropbox settings

## 📦 No Additional Dependencies Required

The implementation uses:
- Google APIs loaded dynamically via CDN
- Dropbox SDK loaded dynamically via CDN
- Existing `react-icons` package (already in your project)

No additional npm packages needed!

## 🎨 Customization

### Styling
The cloud picker modal can be customized in `frontend/src/components/CloudStoragePicker.css`

### Supported File Types
Currently configured for images. To change, edit the extensions in `cloudStorageService.js`:

```javascript
// Google Drive
.setMimeTypes('image/png,image/jpeg,image/jpg,image/gif,image/bmp')

// Dropbox
extensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp']
```

## 📖 Documentation Links

- [Google Drive Picker API](https://developers.google.com/drive/picker)
- [Dropbox Chooser](https://www.dropbox.com/developers/chooser)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)

## 🚀 Ready to Use

Once configured, users can:
1. Click "Import from Cloud" button
2. Choose Google Drive or Dropbox
3. Authenticate (Google Drive only, first time)
4. Select their image
5. The image will be uploaded automatically to your metadata stripper

Enjoy! 🎉
