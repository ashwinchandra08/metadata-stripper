// src/utils/storageUtils.js

const DB_NAME = 'MetadataStripperDB';
const STORE_NAME = 'images';
const DB_VERSION = 1;

/**
 * Open IndexedDB database
 */
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
};

/**
 * Save image data to IndexedDB
 */
/**
 * Save image data to IndexedDB
 */
export const saveImageData = async (imageData) => {
  let db;
  try {
    db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    await new Promise((resolve, reject) => {
      const request = store.put(imageData, 'currentImage');
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error saving image data:', error);
  } finally {
    if (db) db.close();
  }
};

/**
 * Load image data from IndexedDB
 */
export const loadImageData = async () => {
  let db;
  try {
    db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    const imageData = await new Promise((resolve, reject) => {
      const request = store.get('currentImage');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return imageData;
  } catch (error) {
    console.error('Error loading image data:', error);
    return null;
  } finally {
    if (db) db.close();
  }
};

/**
 * Clear image data from IndexedDB
 */
export const clearImageData = async () => {
  let db;
  try {
    db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    await new Promise((resolve, reject) => {
      const request = store.delete('currentImage');
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error clearing image data:', error);
  } finally {
    if (db) db.close();
  }
};

/**
 * Convert File to storable format
 */
export const fileToStorable = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: reader.result,
        lastModified: file.lastModified
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Convert storable format back to File
 */
export const storableToFile = (storable) => {
  if (!storable || typeof storable.dataUrl !== 'string') return null;
  
  // Convert data URL to blob
  const arr = storable.dataUrl.split(',');
  if (arr.length < 2) {
    console.error('Invalid dataUrl format in storable object');
    return null;
  }
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch || !mimeMatch[1]) {
    console.error('Unable to extract MIME type from dataUrl');
    return null;
  }
  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  const blob = new Blob([u8arr], { type: mime });
  
  // Create File from blob
  return new File([blob], storable.name, {
    type: storable.type,
    lastModified: storable.lastModified
  });
};