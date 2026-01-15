// Configuration - API keys from environment variables
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const DROPBOX_APP_KEY = import.meta.env.VITE_DROPBOX_APP_KEY;

// Google Drive Picker
let googleApiLoaded = false;
let googlePickerLoaded = false;
let googleAccessToken = null;

const loadGoogleApi = () => {
  return new Promise((resolve, reject) => {
    if (googleApiLoaded) {
      resolve();
      return;
    }

    if (window.gapi) {
      googleApiLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      window.gapi.load('client:picker', () => {
        googleApiLoaded = true;
        resolve();
      });
    };
    script.onerror = () => reject(new Error('Failed to load Google API'));
    document.body.appendChild(script);
  });
};

const authenticateGoogle = async () => {
  return new Promise((resolve, reject) => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/drive.readonly',
      callback: (response) => {
        if (response.error) {
          reject(new Error(response.error));
          return;
        }
        googleAccessToken = response.access_token;
        resolve(response.access_token);
      },
    });
    tokenClient.requestAccessToken();
  });
};

const downloadFileFromGoogleDrive = async (fileId, fileName, mimeType) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to download file from Google Drive');
    }

    const blob = await response.blob();
    return new File([blob], fileName, { type: mimeType || blob.type });
  } catch (error) {
    throw new Error(`Google Drive download failed: ${error.message}`);
  }
};

export const openGoogleDrivePicker = async (onFileSelect) => {
  try {
    // Load Google API and authenticate
    await loadGoogleApi();
    
    // Load Google Identity Services
    if (!window.google?.accounts) {
      const gisScript = document.createElement('script');
      gisScript.src = 'https://accounts.google.com/gsi/client';
      await new Promise((resolve, reject) => {
        gisScript.onload = resolve;
        gisScript.onerror = () => reject(new Error('Failed to load Google Identity Services'));
        document.body.appendChild(gisScript);
      });
    }

    // Authenticate if needed
    if (!googleAccessToken) {
      await authenticateGoogle();
    }

    // Create and show picker
    const picker = new window.google.picker.PickerBuilder()
      .addView(
        new window.google.picker.DocsView(window.google.picker.ViewId.DOCS_IMAGES)
          .setMimeTypes('image/png,image/jpeg,image/jpg,image/gif,image/bmp')
      )
      .setOAuthToken(googleAccessToken)
      .setDeveloperKey(GOOGLE_API_KEY)
      .setCallback(async (data) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const doc = data.docs[0];
          const file = await downloadFileFromGoogleDrive(
            doc.id,
            doc.name,
            doc.mimeType
          );
          onFileSelect(file);
        }
      })
      .build();

    picker.setVisible(true);
  } catch (error) {
    console.error('Google Drive picker error:', error);
    throw error;
  }
};

// Dropbox Chooser
const loadDropboxChooser = () => {
  return new Promise((resolve, reject) => {
    if (window.Dropbox) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.dropbox.com/static/api/2/dropins.js';
    script.id = 'dropboxjs';
    script.setAttribute('data-app-key', DROPBOX_APP_KEY);
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Dropbox SDK'));
    document.body.appendChild(script);
  });
};

const downloadFileFromDropbox = async (url, fileName) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to download file from Dropbox');
    }
    const blob = await response.blob();
    return new File([blob], fileName, { type: blob.type });
  } catch (error) {
    throw new Error(`Dropbox download failed: ${error.message}`);
  }
};

export const openDropboxChooser = async (onFileSelect) => {
  try {
    await loadDropboxChooser();

    window.Dropbox.choose({
      success: async (files) => {
        const file = await downloadFileFromDropbox(files[0].link, files[0].name);
        onFileSelect(file);
      },
      cancel: () => {
        // User cancelled, do nothing
      },
      linkType: 'direct',
      multiselect: false,
      extensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp'],
      folderselect: false,
    });
  } catch (error) {
    console.error('Dropbox chooser error:', error);
    throw error;
  }
};
