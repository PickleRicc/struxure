import { supabase } from '../../../utils/supabase';
import { uploadToBlob } from '../../../utils/azure';
import { shouldExcludeFile, getContentType } from '../../../utils/fileUtils';
import formidable from 'formidable';
import { createReadStream } from 'fs';
import { join } from 'path';

// Disable body parsing, we'll handle the form data manually
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  console.log(' [POST] /api/files/upload - Starting request');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the token from the request header
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    console.log(' No authorization token provided');
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Verify user authentication
    console.log(' Verifying user authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.log(' Authentication failed:', authError?.message || 'No user found');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Parse form data with updated options
    const form = formidable({ 
      multiples: true,
      keepExtensions: true,
      allowEmptyFiles: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB
      filter: function({ name, originalFilename, mimetype }) {
        // Log file info for debugging
        console.log(' Processing file:', { name, originalFilename, mimetype });
        
        // Skip files that should be excluded
        if (originalFilename && shouldExcludeFile(originalFilename)) {
          console.log(' Skipping excluded file:', originalFilename);
          return false;
        }
        return true;
      }
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error(' Form parsing error:', err);
          reject(err);
        }
        resolve([fields, files]);
      });
    });

    console.log('📦 Received fields:', fields);
    console.log('📦 Received files:', Object.keys(files).length);

    // Extract and validate projectId
    const projectId = Array.isArray(fields.projectId) 
      ? fields.projectId[0]  // Take first item if array
      : fields.projectId;    // Otherwise use as is

    if (!projectId) {
      console.log('❌ No project ID provided');
      return res.status(400).json({ error: 'Project ID is required' });
    }

    console.log('📂 Processing files for project:', projectId);

    // Verify project belongs to user
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      console.log(' Project verification failed');
      return res.status(403).json({ error: 'Project not found or access denied' });
    }

    const uploadedFiles = [];
    const errors = [];

    // Handle multiple files
    const fileArray = Array.isArray(files.file) ? files.file : [files.file];
    console.log(' Processing', fileArray.length, 'files');

    for (const file of fileArray) {
      try {
        if (!file || !file.originalFilename) {
          console.log(' Skipping invalid file entry');
          continue;
        }

        console.log(' Uploading file:', file.originalFilename);
        const content = createReadStream(file.filepath);
        const blobUrl = await uploadToBlob(
          projectId,
          file.originalFilename,
          content,
          file.filepath
        );

        // Store file metadata in Supabase
        const { data: fileData, error: fileError } = await supabase
          .from('files')
          .insert([
            {
              project_id: projectId,
              user_id: user.id,
              filename: file.originalFilename,
              azure_blob_url: blobUrl
            }
          ])
          .select()
          .single();

        if (fileError) throw fileError;
        uploadedFiles.push(fileData);
        console.log(' File uploaded successfully:', file.originalFilename);
      } catch (error) {
        console.error(' Error processing file:', file?.originalFilename, error);
        errors.push({ file: file?.originalFilename, error: error.message });
      }
    }

    return res.status(200).json({
      success: true,
      files: uploadedFiles,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error(' Upload error:', error);
    return res.status(500).json({ error: error.message });
  }
}
