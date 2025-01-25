import { supabase } from '../../../utils/supabase';

export default async function handler(req, res) {
  console.log('🚀 [GET] /api/files/list - Starting request');

  if (req.method !== 'GET') {
    console.log('❌ Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the token from the request header
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    console.log('❌ No authorization token provided');
    return res.status(401).json({ error: 'No token provided' });
  }

  const { projectId } = req.query;
  if (!projectId) {
    console.log('❌ No project ID provided');
    return res.status(400).json({ error: 'Project ID is required' });
  }

  try {
    // Verify user authentication
    console.log('👤 Verifying user authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.log('❌ Authentication failed:', authError?.message || 'No user found');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Verify project belongs to user
    console.log('🔍 Verifying project access...');
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      console.log('❌ Project verification failed');
      return res.status(403).json({ error: 'Project not found or access denied' });
    }

    // Get files for project
    console.log('📚 Fetching files for project:', projectId);
    const { data: files, error: filesError } = await supabase
      .from('files')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (filesError) {
      console.error('❌ Error fetching files:', filesError);
      throw filesError;
    }

    console.log('✅ Successfully fetched files:', {
      count: files?.length || 0
    });

    return res.status(200).json(files || []);
  } catch (error) {
    console.error('❌ Files list error:', error);
    return res.status(500).json({ error: error.message });
  }
}
