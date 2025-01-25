import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../../utils/AuthContext';
import FileUpload from '../../components/FileUpload';
import { supabase } from '../../utils/supabase';

export default function ProjectPage() {
  const router = useRouter();
  const { id: projectId } = router.query;
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !projectId) return;
    fetchProjectAndFiles();
  }, [user, projectId]);

  const fetchProjectAndFiles = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get project details
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (projectError) throw projectError;
      setProject(project);

      // Get files
      const { data: files, error: filesError } = await supabase
        .from('files')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (filesError) throw filesError;
      setFiles(files || []);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (result) => {
    console.log('Upload completed:', result);
    fetchProjectAndFiles(); // Refresh the file list
  };

  if (!user) {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
        <div className="text-red-400 text-center">
          {error || 'Project not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
          >
            Back to Dashboard
          </button>
        </div>

        {/* File Upload Component */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
          <FileUpload 
            projectId={projectId} 
            onUploadComplete={handleUploadComplete} 
          />
        </div>

        {/* Files List */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Files</h2>
          {files.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              No files uploaded yet
            </div>
          ) : (
            <div className="grid gap-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="bg-white/5 backdrop-blur-lg rounded-lg p-4 border border-white/10"
                >
                  <div className="font-medium">{file.filename}</div>
                  <div className="text-sm text-gray-400 mt-1">
                    Uploaded {new Date(file.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
