//@ts-nocheck

import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import formidable from 'formidable';

// Promisify some filesystem functions for cleaner async/await code
const mkdir = promisify(fs.mkdir);
const rename = promisify(fs.rename);

/**
 * Save a file locally or prepare for cloud upload in the future
 * @param {string} companyName - The name of the company
 * @param {string} companyId - The company ID
 * @param {string} folderName - Subfolder (e.g., 'company' or an exercise ID)
 * @param {File} file - The file to upload
 * @returns {string} The path to the uploaded file (or the cloud URL in the future)
 */
export async function saveFileLocally(companyName: string, companyId: string, folderName: string, file: formidable.File) {
  try {
    const basePath = path.join(process.cwd(), 'public', 'uploads', companyName, companyId);
    const folderPath = path.join(basePath, folderName);

    // Ensure that the folders exist
    if (!fs.existsSync(basePath)) await mkdir(basePath, { recursive: true });
    if (!fs.existsSync(folderPath)) await mkdir(folderPath, { recursive: true });

    // Define the path where the file will be stored
    const filePath = path.join(folderPath, file.originalFilename);

    // Move the file from the temporary directory to the destination
    await rename(file.filepath, filePath);

    return `/uploads/${companyName}/${companyId}/${folderName}/${file.originalFilename}`;
  } catch (error) {
    console.error('Error saving file locally:', error);
    throw new Error('Error saving file');
  }
}

// Placeholder for cloud storage integration (e.g., Cloudinary, AWS S3)
export async function saveFileToCloud(companyName: string, companyId: string, folderName: string, file: formidable.File) {
  // Cloudinary or S3 logic can go here for future migration
  return 'cloud-upload-url';
}
