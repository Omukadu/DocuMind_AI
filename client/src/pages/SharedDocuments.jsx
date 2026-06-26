import { useEffect, useState } from 'react';
import { Share2, Link, Eye, Download, Trash2, Clock, Lock } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { getDocuments } from '../services/documentService';
import { getShares, revokeShare } from '../services/shareService';
import { formatDate, formatRelativeTime } from '../utils/formatters';
import FileTypeIcon from '../components/shared/FileTypeIcon';
import EmptyState from '../components/shared/EmptyState';
import toast from 'react-hot-toast';

export default function SharedDocuments() {
  const { currentWorkspace } = useWorkspace();
  const [sharedDocs, setSharedDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentWorkspace?._id) return;
    setLoading(true);
    getDocuments({ workspaceId: currentWorkspace._id, limit: 100 })
      .then(({ data }) => {
        const shared = data.documents.filter(d => d.isShared);
        setSharedDocs(shared);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentWorkspace?._id]);

  const handleCopyLink = (token) => {
    navigator.clipboard.writeText(`${window.location.origin}/shared/${token}`);
    toast.success('Link copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Shared Documents</h1>
        <p className="text-gray-500 text-sm mt-0.5">Documents with active share links</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="card animate-pulse h-20" />)}
        </div>
      ) : sharedDocs.length === 0 ? (
        <EmptyState
          icon={Share2}
          title="No shared documents"
          description="Documents you share will appear here with their access logs."
        />
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="divide-y divide-white/5">
            {sharedDocs.map(doc => (
              <div key={doc._id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/2 transition-colors">
                <FileTypeIcon fileType={doc.fileType} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate">{doc.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Eye size={11} /> {doc.viewCount} views
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Download size={11} /> {doc.downloadCount} downloads
                    </span>
                    {doc.shareSettings?.expiresAt && (
                      <span className="flex items-center gap-1 text-xs text-orange-400">
                        <Clock size={11} /> Expires {formatDate(doc.shareSettings.expiresAt)}
                      </span>
                    )}
                    {doc.shareSettings?.password && (
                      <span className="flex items-center gap-1 text-xs text-yellow-400">
                        <Lock size={11} /> Password protected
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-600 hidden md:block">Shared {formatRelativeTime(doc.updatedAt)}</p>
                <button
                  onClick={() => handleCopyLink(doc._id)}
                  className="btn-secondary text-xs py-1.5 px-3">
                  <Link size={12} /> Copy Link
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
