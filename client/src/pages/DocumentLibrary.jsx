import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Grid,
  List,
  Upload,
  Trash2,
  FolderPlus,
  Filter,
  ChevronRight,
  Star,
  MoreVertical,
  Download,
  Eye,
  RefreshCw,
  FileText,
} from "lucide-react";
import { useWorkspace } from '../context/WorkspaceContext';
import { useDocuments } from '../hooks/useDocuments';
import { getFolders, createFolder } from '../services/folderService';
import { downloadDocument } from '../services/documentService';
import FileTypeIcon from '../components/shared/FileTypeIcon';
import EmptyState from '../components/shared/EmptyState';
import Modal from '../components/shared/Modal';
import { formatFileSize, formatRelativeTime, getStatusColor } from '../utils/formatters';
import toast from 'react-hot-toast';

export default function DocumentLibrary() {
  const { currentWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { documents, loading, pagination, fetchDocuments, deleteDoc, toggleFav } = useDocuments();

  const [view, setView] = useState('grid');
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedIds, setSelectedIds] = useState([]);
  const [newFolderModal, setNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('');

  const loadDocuments = useCallback(() => {
    if (!currentWorkspace?._id) return;
    fetchDocuments({
      workspaceId: currentWorkspace._id,
      folderId: currentFolder || 'root',
      search: search || undefined,
      fileType: fileTypeFilter || undefined,
    });
  }, [currentWorkspace?._id, currentFolder, search, fileTypeFilter, fetchDocuments]);

  const loadFolders = useCallback(async () => {
    if (!currentWorkspace?._id) return;
    try {
      const { data } = await getFolders({ workspaceId: currentWorkspace._id, parentId: currentFolder || 'root' });
      setFolders(data.folders);
    } catch {}
  }, [currentWorkspace?._id, currentFolder]);

  useEffect(() => { loadDocuments(); loadFolders(); }, [loadDocuments, loadFolders]);

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      await createFolder({ name: newFolderName, workspaceId: currentWorkspace._id, parentId: currentFolder });
      toast.success('Folder created');
      setNewFolderModal(false);
      setNewFolderName('');
      loadFolders();
    } catch { toast.error('Failed to create folder'); }
  };

  const handleDownload = async (doc, e) => {
    e.stopPropagation();
    try {
      const res = await downloadDocument(doc._id);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = Object.assign(document.createElement('a'), { href: url, download: doc.originalName });
      a.click(); URL.revokeObjectURL(url);
    } catch { toast.error('Download failed'); }
  };

  const toggleSelect = (id) => setSelectedIds(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const fileTypes = ['pdf', 'word', 'excel', 'powerpoint', 'image', 'csv', 'text'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Document Library</h1>
          <p className="text-gray-500 text-sm mt-0.5">{pagination?.total || 0} documents</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setNewFolderModal(true)} className="btn-secondary text-sm">
            <FolderPlus size={15} /> New Folder
          </button>
          <button onClick={() => navigate('/upload')} className="btn-primary text-sm">
            <Upload size={15} /> Upload
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && loadDocuments()}
            placeholder="Search documents..." className="input pl-8 text-sm py-2" />
        </div>

        <select value={fileTypeFilter} onChange={e => setFileTypeFilter(e.target.value)}
          className="input text-sm py-2 w-36 bg-dark-700">
          <option value="">All types</option>
          {fileTypes.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>

        <div className="flex items-center gap-1 bg-dark-800 border border-white/5 rounded-lg p-1">
          {[['grid', Grid], ['list', List]].map(([v, Icon]) => (
            <button key={v} onClick={() => setView(v)}
              className={`p-1.5 rounded ${view === v ? 'bg-brand-600/20 text-brand-400' : 'text-gray-500 hover:text-gray-300'}`}>
              <Icon size={15} />
            </button>
          ))}
        </div>

        <button onClick={() => { setSearch(''); setFileTypeFilter(''); loadDocuments(); }} className="btn-ghost text-sm py-2">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Selected actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-brand-600/10 border border-brand-500/20 rounded-xl">
          <span className="text-sm text-brand-300">{selectedIds.length} selected</span>
          <button onClick={() => { selectedIds.forEach(id => deleteDoc(id)); setSelectedIds([]); }}
            className="btn-danger text-xs py-1.5 px-3">
            <Trash2 size={13} /> Delete
          </button>
          <button onClick={() => setSelectedIds([])} className="btn-ghost text-xs py-1.5">Cancel</button>
        </div>
      )}

      {/* Folder breadcrumb */}
      {currentFolder && (
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <button onClick={() => setCurrentFolder(null)} className="hover:text-brand-400">Root</button>
          <ChevronRight size={14} />
          <span className="text-gray-300">Current folder</span>
        </div>
      )}

      {/* Folders */}
      {folders.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Folders</p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {folders.map(folder => (
              <button key={folder._id} onClick={() => setCurrentFolder(folder._id)}
                className="card-hover p-4 flex flex-col items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ backgroundColor: folder.color + '22', color: folder.color }}>
                  📁
                </div>
                <span className="text-xs text-gray-300 font-medium text-center truncate w-full">{folder.name}</span>
                <span className="text-xs text-gray-600">{folder.documentCount} docs</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      {loading ? (
        <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {[...Array(6)].map((_, i) => <div key={i} className="card animate-pulse h-28" />)}
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents found"
          description={search ? `No results for "${search}"` : 'Upload your first document to get started'}
          action={<button onClick={() => navigate('/upload')} className="btn-primary mx-auto text-sm"><Upload size={14} /> Upload</button>}
        />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map(doc => (
            <div key={doc._id}
              className={`card-hover group relative ${selectedIds.includes(doc._id) ? 'border-brand-500/40' : ''}`}
              onClick={() => navigate(`/documents/${doc._id}`)}>
              <div className="flex items-start gap-3 mb-3">
                <input type="checkbox" checked={selectedIds.includes(doc._id)}
                  onChange={() => toggleSelect(doc._id)}
                  onClick={e => e.stopPropagation()}
                  className="mt-0.5 accent-brand-500" />
                <FileTypeIcon fileType={doc.fileType} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-100 truncate">{doc.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(doc.size)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`badge ${getStatusColor(doc.status)}`}>{doc.status}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={e => { e.stopPropagation(); toggleFav(doc._id); }}
                    className={`p-1.5 rounded hover:bg-white/5 ${doc.favoritedBy?.length ? 'text-yellow-400' : 'text-gray-600'}`}>
                    <Star size={13} fill={doc.favoritedBy?.length ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={e => handleDownload(doc, e)}
                    className="p-1.5 rounded hover:bg-white/5 text-gray-600 hover:text-gray-300">
                    <Download size={13} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); deleteDoc(doc._id); }}
                    className="p-1.5 rounded hover:bg-red-500/10 text-gray-600 hover:text-red-400">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">{formatRelativeTime(doc.createdAt)}</p>
              {doc.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {doc.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="badge bg-dark-700 text-gray-400 text-xs">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="divide-y divide-white/5">
            {documents.map(doc => (
              <div key={doc._id} onClick={() => navigate(`/documents/${doc._id}`)}
                className="flex items-center gap-4 px-5 py-3 hover:bg-white/3 transition-colors cursor-pointer group">
                <input type="checkbox" checked={selectedIds.includes(doc._id)}
                  onChange={() => toggleSelect(doc._id)} onClick={e => e.stopPropagation()}
                  className="accent-brand-500" />
                <FileTypeIcon fileType={doc.fileType} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate">{doc.name}</p>
                  <p className="text-xs text-gray-500">{doc.uploadedBy?.name} · {formatRelativeTime(doc.createdAt)}</p>
                </div>
                <span className="text-xs text-gray-500 hidden md:block">{formatFileSize(doc.size)}</span>
                <span className={`badge ${getStatusColor(doc.status)} hidden sm:inline-flex`}>{doc.status}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={e => { e.stopPropagation(); navigate(`/documents/${doc._id}`); }}
                    className="p-1.5 rounded hover:bg-white/5 text-gray-500 hover:text-gray-300">
                    <Eye size={14} />
                  </button>
                  <button onClick={e => handleDownload(doc, e)}
                    className="p-1.5 rounded hover:bg-white/5 text-gray-500 hover:text-gray-300">
                    <Download size={14} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); deleteDoc(doc._id); }}
                    className="p-1.5 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create folder modal */}
      <Modal open={newFolderModal} onClose={() => setNewFolderModal(false)} title="Create Folder">
        <form onSubmit={handleCreateFolder} className="p-6 space-y-4">
          <div>
            <label className="label">Folder name</label>
            <input autoFocus value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
              placeholder="e.g. Contracts 2024" className="input" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setNewFolderModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Folder</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
