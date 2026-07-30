import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function KnowledgeBase() {
  const { agentId } = useParams();
  const [agent, setAgent] = useState(null);
  const [files, setFiles] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get(`/agents/${agentId}`),
      api.get(`/knowledge-base/${agentId}`),
    ]).then(([agentRes, kbRes]) => {
      setAgent(agentRes.data);
      setFiles(kbRes.data.files || []);
      setIsReady(kbRes.data.isReady || false);
    }).finally(() => setLoading(false));
  }, [agentId]);

  // Auto-refresh jab files processing mein hain
  useEffect(() => {
    const processing = files.some(f => f.status === 'processing');
    if (!processing) return;

    const interval = setInterval(async () => {
      const { data } = await api.get(`/knowledge-base/${agentId}`);
      setFiles(data.files || []);
      setIsReady(data.isReady || false);
      if (!data.files.some(f => f.status === 'processing')) {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [files, agentId]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Only PDF files allowed');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await api.post(`/knowledge-base/${agentId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setFiles(prev => [...prev, data.file]);
      setSuccess('File uploaded! Processing in background...');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (fileId) => {
    if (!confirm('Delete this file? This will remove its knowledge from the agent.')) return;
    try {
      await api.delete(`/knowledge-base/${agentId}/file/${fileId}`);
      setFiles(prev => prev.filter(f => f._id !== fileId));
      setSuccess('File deleted');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'ready') return (
      <span className="text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full">
        ✓ Ready
      </span>
    );
    if (status === 'processing') return (
      <span className="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full animate-pulse">
        ⏳ Processing...
      </span>
    );
    if (status === 'failed') return (
      <span className="text-xs bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full">
        ✗ Failed
      </span>
    );
  };

  if (loading) return (
    <div className="flex justify-center mt-20 text-gray-400">Loading...</div>
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link to="/creator/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">←</Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Knowledge Base</h1>
          <p className="text-sm text-gray-400 mt-0.5">{agent?.title}</p>
        </div>
      </div>

      {/* Status banner */}
      <div className={`rounded-2xl px-5 py-4 mb-8 flex items-center gap-3 ${
        isReady ? 'bg-green-50 border border-green-100' : 'bg-gray-50 border border-gray-200'
      }`}>
        <span className="text-2xl">{isReady ? '🧠' : '📭'}</span>
        <div>
          <p className={`text-sm font-semibold ${isReady ? 'text-green-800' : 'text-gray-700'}`}>
            {isReady ? 'Knowledge Base Active' : 'No Knowledge Base Yet'}
          </p>
          <p className={`text-xs mt-0.5 ${isReady ? 'text-green-600' : 'text-gray-400'}`}>
            {isReady
              ? `${files.filter(f => f.status === 'ready').length} file(s) indexed — Agent will answer from your uploaded content`
              : 'Upload PDFs to give your agent expert knowledge'}
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">✓ {success}</div>
      )}

      {/* Upload area */}
      <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 mb-6 text-center hover:border-gray-400 transition-colors">
        <div className="text-4xl mb-3">📄</div>
        <p className="text-sm font-medium text-gray-700 mb-1">Upload PDF files</p>
        <p className="text-xs text-gray-400 mb-4">
          Max 10MB per file · Max 5 files · PDF only
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleUpload}
          disabled={uploading || files.length >= 5}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || files.length >= 5}
          className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors"
        >
          {uploading ? '⏳ Uploading...' : '+ Upload PDF'}
        </button>
        {files.length >= 5 && (
          <p className="text-xs text-amber-600 mt-2">Maximum 5 files reached</p>
        )}
      </div>

      {/* Files list */}
      {files.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-900 mb-3">
            Uploaded Files
            <span className="text-gray-400 font-normal text-sm ml-2">({files.length}/5)</span>
          </h2>
          <div className="space-y-3">
            {files.map((file) => (
              <div key={file._id} className="border border-gray-200 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl shrink-0">📄</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(file.status)}
                      {file.chunkCount > 0 && (
                        <span className="text-xs text-gray-400">{file.chunkCount} chunks indexed</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(file._id)}
                  className="text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0 ml-3"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="mt-8 bg-gray-50 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">How it works</h3>
        <div className="space-y-2">
          {[
            { icon: '📄', text: 'Upload your PDFs — notes, research papers, SOPs, books' },
            { icon: '🧠', text: 'SkillVerse indexes your content using AI embeddings' },
            { icon: '🔍', text: 'When users ask questions, relevant content is fetched' },
            { icon: '💬', text: 'Agent answers from YOUR knowledge — not generic AI' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-lg shrink-0">{item.icon}</span>
              <p className="text-xs text-gray-500">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}