import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Brain, Download, Lock, Loader2, FileText, AlertCircle } from 'lucide-react';
import { accessSharedDocument } from '../services/shareService';
import FileTypeIcon from '../components/shared/FileTypeIcon';
import { formatFileSize, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

export default function SharedAccess() {
  const { token } = useParams();
  const [doc, setDoc] = useState(null);
  const [allowDownload, setAllowDownload] = useState(true);
  const [loading, setLoading] = useState(true);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const fetchDoc = async (pw) => {
    setChecking(true);
    try {
      const { data } = await accessSharedDocument(token, pw);
      setDoc(data.document);
      setAllowDownload(data.allowDownload);
      setRequiresPassword(false);
      setError('');
    } catch (err) {
      const msg = err.response?.data?.message;
      if (err.response?.data?.requiresPassword || err.response?.status === 401) {
        setRequiresPassword(true);
        if (pw) setError('Invalid password, please try again.');
      } else {
        setError(msg || 'This link is invalid or has expired.');
      }
    } finally { setLoading(false); setChecking(false); }
  };

  useEffect(() => { fetchDoc(); }, [token]);

  const handlePasswordSubmit = (e) => { e.preventDefault(); fetchDoc(password); };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-dark-950">
      <Loader2 size={28} className="text-brand-400 animate-spin" />
    </div>
  );

  if (error && !requiresPassword) return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="card max-w-sm text-center">
        <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white mb-2">Link unavailable</h2>
        <p className="text-gray-400 text-sm mb-4">{error}</p>
        <Link to="/" className="btn-secondary text-sm justify-center">Go to DocuMind AI</Link>
      </div>
    </div>
  );

  if (requiresPassword) return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-slide-up">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <Brain size={22} className="text-brand-400" />
          <span className="font-bold text-white text-xl">DocuMind<span className="text-brand-400">AI</span></span>
        </Link>
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Lock size={18} className="text-yellow-400" />
            <h2 className="text-lg font-bold text-white">Password protected</h2>
          </div>
          <p className="text-gray-400 text-sm mb-5">This shared document requires a password to access.</p>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Enter password" className="input" required autoFocus />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={checking} className="btn-primary w-full justify-center">
              {checking ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
              Access Document
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-950 p-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <Brain size={20} className="text-brand-400" />
          <span className="font-bold text-white">DocuMind<span className="text-brand-400">AI</span></span>
        </Link>
        <div className="card">
          <div className="flex items-start gap-4 mb-6">
            <FileTypeIcon fileType={doc?.fileType} size="lg" />
            <div>
              <h1 className="text-xl font-bold text-white mb-1">{doc?.name}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span>{formatFileSize(doc?.size)}</span>
                <span>·</span>
                <span>Shared document</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-12 bg-dark-900 rounded-xl mb-6">
            <FileTypeIcon fileType={doc?.fileType} size="lg" />
            <p className="text-gray-400 mt-4 mb-6">Document preview is not available in the browser.</p>
            {allowDownload && (
              <a href={`/api/documents/${doc?._id}/download`} className="btn-primary">
                <Download size={15} /> Download Document
              </a>
            )}
          </div>
          {doc?.description && (
            <p className="text-gray-400 text-sm">{doc.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
