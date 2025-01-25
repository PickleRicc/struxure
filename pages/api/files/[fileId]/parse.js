import { supabase } from '../../../../utils/supabase';
import { downloadBlobContent } from '../../../../utils/azure';

export default async function handler(req, res) {
  console.log('🚀 [POST] /api/files/[fileId]/parse - Starting request');

  if (req.method !== 'POST') {
    console.log('❌ Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the token from the request header
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    console.log('❌ No authorization token provided');
    return res.status(401).json({ error: 'No token provided' });
  }

  const { fileId } = req.query;
  if (!fileId) {
    console.log('❌ No file ID provided');
    return res.status(400).json({ error: 'File ID is required' });
  }

  try {
    // Step 1: Verify user authentication
    console.log('👤 Verifying user authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.log('❌ Authentication failed:', authError?.message || 'No user found');
      return res.status(401).json({ error: 'Not authenticated' });
    }
    console.log('✅ User authenticated:', user.id);

    // Step 2: Get file metadata from Supabase
    console.log('🔍 Fetching file metadata...');
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', user.id)
      .single();

    if (fileError || !file) {
      console.log('❌ File not found or access denied');
      return res.status(404).json({ error: 'File not found or access denied' });
    }
    console.log('✅ File metadata retrieved:', file.filename);

    // Step 3: Download and parse file content
    console.log('📥 Downloading file content...');
    const content = await downloadBlobContent(file.azure_blob_url);
    
    console.log('✅ File parsed successfully');
    return res.status(200).json({
      success: true,
      file: {
        id: file.id,
        filename: file.filename,
        content: content,
        project_id: file.project_id
      }
    });
  } catch (error) {
    console.error('❌ Parse error:', error);
    return res.status(500).json({ error: error.message });
  }
}
