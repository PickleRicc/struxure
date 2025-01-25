import { supabase } from '../../../utils/supabase';

export default async function handler(req, res) {
  console.log(' [GET] /api/projects/list - Starting request');

  if (req.method !== 'GET') {
    console.log(' Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the token from the request header
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    console.log(' No authorization token provided');
    return res.status(401).json({ error: 'No token provided' });
  }
  console.log(' Authorization token received');

  try {
    // Step 1: Verify user authentication
    console.log(' Verifying user authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.log(' Authentication failed:', authError?.message || 'No user found');
      return res.status(401).json({ error: 'Not authenticated' });
    }
    console.log(' User authenticated:', { userId: user.id, email: user.email });

    // Step 2: Fetch user's projects
    console.log(' Fetching projects for user:', user.id);
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(' Database query failed:', error);
      throw error;
    }

    console.log(' Successfully fetched projects:', {
      count: projects?.length || 0,
      projectIds: projects?.map(p => p.id) || []
    });

    return res.status(200).json(projects || []);
  } catch (error) {
    console.error(' Project list error:', error);
    return res.status(500).json({ error: error.message });
  }
}
