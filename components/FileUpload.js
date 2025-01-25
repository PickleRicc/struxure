import { useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import { supabase } from '../utils/supabase';

export default function FileUpload({ projectId, onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const handleUpload = async (e) => {
    e.preventDefault();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);
    console.log('Starting upload for project:', projectId);
    console.log('Number of files:', files.length);

    try {
      const formData = new FormData();
      // Ensure projectId is sent as a string
      formData.append('projectId', projectId.toString());
      
      // Add all files to formData
      Array.from(files).forEach((file) => {
        console.log('Adding file to form:', file.name, 'Size:', file.size);
        formData.append('file', file);
      });

      // Get session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }
      
      console.log('Sending files to server...');
      const res = await fetch('/api/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      console.log('Upload results:', data);
      
      if (onUploadComplete) {
        onUploadComplete(data);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-4">
      <div className="mb-4 text-sm text-gray-400">
        Select a folder or multiple files to upload. Binary files will be automatically filtered out.
      </div>
      
      <label className="block">
        <span className="sr-only">Choose files</span>
        <input
          type="file"
          webkitdirectory="true"
          directory="true"
          multiple
          onChange={handleUpload}
          disabled={uploading}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-500 file:text-white
            hover:file:bg-blue-600
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </label>
      
      {uploading && (
        <div className="mt-2 text-sm text-blue-500">
          Uploading files... This may take a moment.
        </div>
      )}
      
      {error && (
        <div className="mt-2 text-sm text-red-500">
          {error}
        </div>
      )}
    </div>
  );
}