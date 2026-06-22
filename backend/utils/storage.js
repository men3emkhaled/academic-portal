const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const useCloudStorage = process.env.USE_CLOUD_STORAGE === 'true';

let supabase = null;
if (useCloudStorage) {
  try {
    supabase = require('../config/supabase');
    if (!supabase) {
      logger.warn('Supabase not configured — falling back to local disk storage');
    }
  } catch (err) {
    logger.warn({ err: err.message }, 'Failed to initialize Supabase — falling back to local disk');
  }
}

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Upload a file to storage (Supabase in production, local disk in dev).
 * @param {Object} file - Multer file object with buffer, originalname, mimetype
 * @param {string} subfolder - Optional subfolder within uploads (e.g. 'avatars', 'materials')
 * @returns {Promise<string>} Public URL or local path
 */
async function uploadFile(file, subfolder = '') {
  if (useCloudStorage && supabase) {
    return uploadToSupabase(file, subfolder);
  }
  return saveToDisk(file, subfolder);
}

async function uploadToSupabase(file, subfolder) {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'academic-portal';
  const timestamp = Date.now();
  const ext = path.extname(file.originalname);
  const sanitizedName = `${timestamp}-${Math.round(Math.random() * 1E9)}${ext}`;
  const filePath = subfolder ? `${subfolder}/${sanitizedName}` : sanitizedName;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    logger.error({ err: error.message, filePath }, 'Supabase upload failed — falling back to disk');
    return saveToDisk(file, subfolder);
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl;
}

async function saveToDisk(file, subfolder) {
  const targetDir = subfolder ? path.join(uploadsDir, subfolder) : uploadsDir;
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const timestamp = Date.now();
  const ext = path.extname(file.originalname);
  const filename = `${timestamp}-${Math.round(Math.random() * 1E9)}${ext}`;
  const filePath = path.join(targetDir, filename);

  if (file.buffer) {
    fs.writeFileSync(filePath, file.buffer);
  } else if (file.path) {
    fs.renameSync(file.path, filePath);
  }

  return `/uploads/${subfolder ? subfolder + '/' : ''}${filename}`;
}

/**
 * Delete a file from storage.
 * @param {string} fileUrl - The URL or path of the file to delete
 */
async function deleteFile(fileUrl) {
  if (useCloudStorage && supabase && fileUrl.startsWith('http')) {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'academic-portal';
    const urlParts = new URL(fileUrl);
    const filePath = urlParts.pathname.split(`${bucket}/`)[1];
    if (filePath) {
      const { error } = await supabase.storage.from(bucket).remove([filePath]);
      if (error) {
        logger.error({ err: error.message, filePath }, 'Supabase delete failed');
      }
    }
  } else if (fileUrl.startsWith('/uploads/')) {
    const diskPath = path.join(process.cwd(), fileUrl);
    if (fs.existsSync(diskPath)) {
      fs.unlinkSync(diskPath);
    }
  }
}

module.exports = { uploadFile, deleteFile };
