import { BlobServiceClient } from '@azure/storage-blob';
import { stat } from 'fs/promises';

// Initialize Azure Blob Service Client
const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);

// Get container client
const containerClient = blobServiceClient.getContainerClient('project-files');

export const uploadToBlob = async (projectId, filePath, fileStream, filepath) => {
  try {
    console.log(` Uploading ${filePath} to Azure Blob Storage...`);
    
    // Generate blob name (includes project ID and maintains folder structure)
    const blobName = `${projectId}/${filePath}`;
    console.log('Blob name:', blobName);
    
    // Get blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Get file size
    const stats = await stat(filepath);
    console.log('File size:', stats.size, 'bytes');

    // Upload content with content length
    const options = {
      blobHTTPHeaders: {
        blobContentType: 'text/plain'
      }
    };
    
    await blockBlobClient.uploadStream(
      fileStream,
      stats.size,
      undefined,
      options
    );
    
    console.log(' Upload successful');
    // Return the URL
    return blockBlobClient.url;
  } catch (error) {
    console.error(' Azure upload error:', error);
    throw error;
  }
};
