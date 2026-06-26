import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { Upload, X, CheckCircle, AlertCircle, Loader2, FileText, FolderOpen } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { uploadDocuments } from '../services/documentService';
import { getFolders } from '../services/folderService';
import { formatFileSize } from '../utils/formatters';
import FileTypeIcon from '../components/shared/FileTypeIcon';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

const getFileType = (mimeType, name) => {
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('word') || /\.docx?$/.test(name)) return 'word';
  if (mimeType.includes('excel') || /\.xlsx?$/.test(name)) return 'excel';
  if (mimeType.includes('powerpoint') || /\.pptx?$/.test(name)) return 'powerpoint';
  if (mimeType.includes('image')) return 'image';
  if (mimeType.includes('csv')) return 'csv';
  return 'text';
};

export default function UploadCenter() {
  const { currentWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!currentWorkspace?._id) return;
    getFolders({ workspaceId: currentWorkspace._id, parentId: 'root' })
      .then(({ data }) => setFolders(data.folders)).catch(() => {});
  }, [currentWorkspace?._id]);

  const onDrop = useCallback((accepted, rejected) => {
    const newFiles = accepted.map(f => ({
      file: f, id: Math.random().toString(36).slice(2), status: 'pending',
      progress: 0, type: getFileType(f.type, f.name),
    }));
    setFiles(prev => [...prev, ...newFiles]);
    if (rejected.length) toast.error(`${rejected.length} file(s) rejected. Check file type or size.`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    },
    maxSize: 52428800,
    maxFiles: 10,
  });

  const removeFile = (id) => setFiles(prev => prev.filter(f => f.id !== id));

  const handleUpload = async () => {
    if (!files.length || !currentWorkspace?._id) return;
    setUploading(true);

    const pending = files.filter(f => f.status === 'pending');
    for (const item of pending) {
      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'uploading' } : f));
      try {
        const formData = new FormData();
        formData.append('files', item.file);
        formData.append('workspaceId', currentWorkspace._id);
        if (selectedFolder) formData.append('folderId', selectedFolder);

        await uploadDocuments(formData, (progress) => {
          setFiles(prev => prev.map(f => f.id === item.id ? { ...f, progress } : f));
        });
        setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'done', progress: 100 } : f));
      } catch (err) {
        setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'failed', error: err.response?.data?.message || 'Upload failed' } : f));
      }
    }

    setUploading(false);
    const done = files.filter(f => f.status !== 'failed');
    if (done.length) {
      toast.success(`${pending.length} file(s) uploaded successfully`);
      setTimeout(() => navigate('/documents'), 1500);
    }
  };

  const pendingCount = files.filter(f => f.status === 'pending').length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Upload Center</h1>
        <p className="text-gray-500 text-sm mt-0.5">Upload up to 10 files at once, max 50MB each</p>
      </div>

      {/* Folder selector */}
      {folders.length > 0 && (
        <div className="flex items-center gap-3">
          <FolderOpen size={16} className="text-gray-500" />
          <select value={selectedFolder} onChange={e => setSelectedFolder(e.target.value)}
            className="input text-sm py-2 w-56 bg-dark-700">
            <option value="">Root (no folder)</option>
            {folders.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
          </select>
        </div>
      )}

      {/* Drop zone */}
      <div {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200
          ${isDragActive ? 'border-brand-500 bg-brand-500/5' : 'border-white/10 hover:border-brand-500/40 hover:bg-white/2'}`}>
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${isDragActive ? 'bg-brand-500/20' : 'bg-dark-700'}`}>
            <Upload size={28} className={isDragActive ? 'text-brand-400' : 'text-gray-500'} />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-200 mb-1">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-gray-500 text-sm">or click to browse</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {['PDF', 'Word', 'Excel', 'PowerPoint', 'Images', 'CSV', 'Text'].map(t => (
              <span key={t} className="badge bg-dark-700 text-gray-400">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-300">{files.length} file(s) queued</h3>
            {!uploading && <button onClick={() => setFiles([])} className="text-xs text-gray-500 hover:text-gray-300">Clear all</button>}
          </div>
          <div className="space-y-2.5">
            {files.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-4 bg-dark-800 border border-white/5 rounded-xl">
                <FileTypeIcon fileType={item.type} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate">{item.file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(item.file.size)}</p>
                  {(item.status === 'uploading') && (
                    <div className="mt-2 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full transition-all duration-300"
                        style={{ width: `${item.progress}%` }} />
                    </div>
                  )}
                  {item.status === 'failed' && (
                    <p className="text-xs text-red-400 mt-1">{item.error}</p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {item.status === 'pending' && (
                    <button onClick={() => removeFile(item.id)} className="p-1.5 rounded hover:bg-white/5 text-gray-500 hover:text-gray-300">
                      <X size={14} />
                    </button>
                  )}
                  {item.status === 'uploading' && <Loader2 size={16} className="text-brand-400 animate-spin" />}
                  {item.status === 'done' && <CheckCircle size={16} className="text-green-400" />}
                  {item.status === 'failed' && <AlertCircle size={16} className="text-red-400" />}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setFiles([])} disabled={uploading} className="btn-secondary">Clear</button>
            <button onClick={handleUpload} disabled={uploading || pendingCount === 0} className="btn-primary">
              {uploading ? <><Loader2 size={15} className="animate-spin" /> Uploading...</> : <><Upload size={15} /> Upload {pendingCount} file(s)</>}
            </button>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="card bg-dark-900/50">
        <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <FileText size={14} className="text-brand-400" /> Upload tips
        </h3>
        <ul className="space-y-1.5 text-sm text-gray-500">
          <li>• Maximum file size: 50MB per file</li>
          <li>• Up to 10 files per upload batch</li>
          <li>• AI summaries are available after processing completes</li>
          <li>• Use folders to keep your workspace organized</li>
        </ul>
      </div>
    </div>
  );
}
