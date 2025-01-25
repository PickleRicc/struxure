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

export const downloadBlobContent = async (blobUrl) => {
  try {
    console.log('📥 Downloading blob content from:', blobUrl);
    
    // Extract blob name from URL and properly decode it
    const url = new URL(blobUrl);
    const blobName = decodeURIComponent(url.pathname.split('/project-files/')[1]);
    
    if (!blobName) {
      throw new Error('Invalid blob URL');
    }

    console.log('🔍 Blob name:', blobName);
    
    // Get blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Check if file is binary (based on extension)
    const isBinary = /\.(rpm|exe|dll|bin|zip|tar|gz|rar|7z|iso)$/i.test(blobName);
    if (isBinary) {
      throw new Error('Binary files cannot be viewed as text');
    }

    // Download content
    const downloadResponse = await blockBlobClient.download();
    console.log('✅ Blob download successful');

    // Convert stream to text
    const content = await streamToText(downloadResponse.readableStreamBody);
    console.log('✅ Content converted to text');
    
    return content;
  } catch (error) {
    console.error('❌ Azure download error:', error);
    throw error;
  }
};

// Helper function to convert stream to text
async function streamToText(readable) {
  readable.setEncoding('utf8');
  let data = '';
  for await (const chunk of readable) {
    data += chunk;
  }
  return data;
}
