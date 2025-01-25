import { useState } from 'react';
import { supabase } from '../utils/supabase';

export default function FileViewer({ fileId }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/files/${fileId}/parse`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setContent(data.file);
      console.log('File content loaded:', data.file.filename);
    } catch (err) {
      console.error('Error loading file:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10">
      {!content && !loading && (
        <button
          onClick={fetchContent}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white"
        >
          View File Content
        </button>
      )}

      {loading && (
        <div className="text-blue-400">Loading...</div>
      )}

      {error && (
        <div className="text-red-400">{error}</div>
      )}

      {content && (
        <div>
          <div className="mb-2 font-medium">{content.filename}</div>
          <pre className="p-4 bg-gray-900 rounded-lg overflow-auto max-h-96 text-sm">
            {content.content}
          </pre>
        </div>
      )}
    </div>
  );
}
