import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Download, Share2, Sparkles, ArrowLeft, FileText,
  Tag, Eye, Calendar, User, Loader2, Star, MessageSquare, Save,
  AlertCircle, RefreshCw,
} from 'lucide-react';
import { getDocument, downloadDocument, toggleFavorite, saveNotes, reprocessDocument } from '../services/documentService';
import { generateSummary } from '../services/aiService';
import { createShare } from '../services/shareService';
import { formatFileSize, formatDate, getStatusColor } from '../utils/formatters';
import FileTypeIcon from '../components/shared/FileTypeIcon';
import Modal from '../components/shared/Modal';
import toast from 'react-hot-toast';

export default function DocumentViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('metadata');
  const [shareModal, setShareModal] = useState(false);
  const [shareSettings, setShareSettings] = useState({ isPublic: true, allowDownload: true, password: '', expiresAt: '' });
  const [shareLink, setShareLink] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesDirty, setNotesDirty] = useState(false);
  const [reprocessing, setReprocessing] = useState(false);

  useEffect(() => {
    setLoading(true);
    getDocument(id)
      .then(({ data }) => {
        setDoc(data.document);
        setNotes(data.document.notes || '');
        if (data.document.aiSummary?.executive) setSummary(data.document.aiSummary);
      })
      .catch(() => { toast.error('Document not found'); navigate('/documents'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    setActiveTab('ai');
    try {
      const { data } = await generateSummary(id);
      setSummary(data.summary);
      toast.success('AI summary generated');
    } catch { toast.error('Failed to generate summary'); }
    finally { setSummaryLoading(false); }
  };

  const handleDownload = async () => {
    try {
      const res = await downloadDocument(id);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = Object.assign(document.createElement('a'), { href: url, download: doc.originalName });
      a.click(); URL.revokeObjectURL(url);
    } catch { toast.error('Download failed'); }
  };

  const handleShare = async () => {
    setShareLoading(true);
    try {
      const { data } = await createShare({ documentId: id, ...shareSettings, password: shareSettings.password || undefined, expiresAt: shareSettings.expiresAt || undefined });
      setShareLink(data.shareUrl);
      toast.success('Share link created');
    } catch { toast.error('Failed to create share link'); }
    finally { setShareLoading(false); }
  };

  const handleToggleFav = async () => {
    const { data } = await toggleFavorite(id);
    setDoc(prev => ({ ...prev, favoritedBy: data.document.favoritedBy }));
  };

  const handleSaveNotes = async () => {
    setNotesSaving(true);
    try {
      await saveNotes(id, notes);
      setNotesDirty(false);
      toast.success('Notes saved');
    } catch { toast.error('Failed to save notes'); }
    finally { setNotesSaving(false); }
  };

  const handleReprocess = async () => {
    setReprocessing(true);
    try {
      const { data } = await reprocessDocument(id);
      setDoc(prev => ({ ...prev, status: data.document.status, content: data.document.content, metadata: data.document.metadata, processingError: null }));
      toast.success(`Reprocessed — ${data.wordCount?.toLocaleString() || 0} words extracted`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reprocess failed');
    } finally {
      setReprocessing(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={28} className="text-brand-400 animate-spin" />
    </div>
  );
  if (!doc) return null;

  const tabs = [
    { id: 'metadata', label: 'Details', icon: FileText },
    { id: 'ai', label: 'AI Summary', icon: Sparkles },
    { id: 'notes', label: 'Notes', icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate('/documents')} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 flex-shrink-0">
            <ArrowLeft size={18} />
          </button>
          <FileTypeIcon fileType={doc.fileType} size="lg" />
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-white truncate">{doc.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={`badge ${getStatusColor(doc.status)}`}>{doc.status}</span>
              <span className="text-xs text-gray-500">{formatFileSize(doc.size)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={handleToggleFav}
            className={`p-2 rounded-lg hover:bg-white/5 transition-colors ${doc.favoritedBy?.length ? 'text-yellow-400' : 'text-gray-500'}`}>
            <Star size={16} fill={doc.favoritedBy?.length ? 'currentColor' : 'none'} />
          </button>
          <button onClick={() => navigate(`/ai?documentId=${id}&mode=document`)} className="btn-secondary text-sm">
            <MessageSquare size={14} /> Chat
          </button>
          <button onClick={() => setShareModal(true)} className="btn-secondary text-sm">
            <Share2 size={14} /> Share
          </button>
          <button onClick={handleDownload} className="btn-secondary text-sm">
            <Download size={14} /> Download
          </button>
          <button onClick={handleGenerateSummary} disabled={summaryLoading} className="btn-primary text-sm">
            {summaryLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            AI Summary
          </button>
        </div>
      </div>

      {/* Extraction failure banner */}
      {doc.status === 'failed' && (
        <div className="flex items-start gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl">
          <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-400">Text extraction failed</p>
            {doc.processingError && (
              <p className="text-xs text-red-300/70 mt-0.5 font-mono">{doc.processingError}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              The file is saved but could not be parsed. Click Reprocess to try again, or download and verify the file is not corrupted.
            </p>
          </div>
          <button onClick={handleReprocess} disabled={reprocessing} className="btn-secondary text-xs flex-shrink-0">
            {reprocessing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            Reprocess
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Document preview */}
        <div className="lg:col-span-2 card flex flex-col min-h-96">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
            <h2 className="text-sm font-semibold text-gray-300">Document Preview</h2>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Eye size={12} /> {doc.viewCount} views
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center py-12 bg-dark-900/50 rounded-xl border border-white/5">
            <FileTypeIcon fileType={doc.fileType} size="lg" />
            <p className="text-gray-400 font-medium mt-4 mb-1">{doc.originalName}</p>
            <p className="text-gray-600 text-sm mb-6">
              {doc.fileType.toUpperCase()} · {formatFileSize(doc.size)}
              {doc.metadata?.pageCount ? ` · ${doc.metadata.pageCount} pages` : ''}
              {doc.metadata?.wordCount ? ` · ${doc.metadata.wordCount.toLocaleString()} words` : ''}
            </p>
            <div className="flex gap-3">
              <button onClick={handleDownload} className="btn-primary text-sm">
                <Download size={14} /> Download to View
              </button>
              <button onClick={() => navigate(`/ai?documentId=${id}&mode=document`)} className="btn-secondary text-sm">
                <Sparkles size={14} /> Ask AI
              </button>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 bg-dark-800 border border-white/5 rounded-xl p-1">
            {tabs.map(({ id: tabId, label, icon: Icon }) => (
              <button key={tabId} onClick={() => setActiveTab(tabId)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg transition-all ${activeTab === tabId ? 'bg-brand-600/20 text-brand-400' : 'text-gray-500 hover:text-gray-300'}`}>
                <Icon size={13} />{label}
              </button>
            ))}
          </div>

          {activeTab === 'metadata' && (
            <div className="card space-y-4">
              {[
                { icon: User, label: 'Uploaded by', value: doc.uploadedBy?.name },
                { icon: Calendar, label: 'Created', value: formatDate(doc.createdAt) },
                { icon: Calendar, label: 'Modified', value: formatDate(doc.updatedAt) },
                { icon: FileText, label: 'Type', value: doc.fileType?.toUpperCase() },
                { icon: Eye, label: 'Views', value: doc.viewCount },
                { icon: Download, label: 'Downloads', value: doc.downloadCount },
              ].map(({ icon: Icon, label, value }) => value !== undefined && (
                <div key={label} className="flex items-center gap-2">
                  <Icon size={14} className="text-gray-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-sm text-gray-200">{value}</p>
                  </div>
                </div>
              ))}
              {doc.metadata?.pageCount && (
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">Pages / Words</p>
                    <p className="text-sm text-gray-200">{doc.metadata.pageCount} pages · {doc.metadata.wordCount?.toLocaleString()} words</p>
                  </div>
                </div>
              )}
              {doc.tags?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag size={14} className="text-gray-600" />
                    <p className="text-xs text-gray-500">Tags</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {doc.tags.map(tag => (
                      <span key={tag} className="badge bg-dark-700 text-gray-400">#{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-3">
              {summaryLoading ? (
                <div className="card flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 size={28} className="text-brand-400 animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-400">Analyzing document...</p>
                  </div>
                </div>
              ) : summary ? (
                <>
                  <div className="card">
                    <h3 className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-2">Executive Summary</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">{summary.executive}</p>
                  </div>
                  {summary.keyInsights?.length > 0 && (
                    <div className="card">
                      <h3 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2">Key Insights</h3>
                      <ul className="space-y-1.5">
                        {summary.keyInsights.map((ins, i) => (
                          <li key={i} className="text-sm text-gray-300 flex gap-2"><span className="text-green-400 flex-shrink-0">•</span>{ins}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {summary.risks?.length > 0 && (
                    <div className="card">
                      <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Risks</h3>
                      <ul className="space-y-1.5">
                        {summary.risks.map((r, i) => (
                          <li key={i} className="text-sm text-gray-300 flex gap-2"><span className="text-red-400 flex-shrink-0">⚠</span>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {summary.actionItems?.length > 0 && (
                    <div className="card">
                      <h3 className="text-xs font-semibold text-yellow-400 uppercase tracking-wider mb-2">Action Items</h3>
                      <ul className="space-y-1.5">
                        {summary.actionItems.map((a, i) => (
                          <li key={i} className="text-sm text-gray-300 flex gap-2"><span className="text-yellow-400 flex-shrink-0">{i + 1}.</span>{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {summary.generatedAt && (
                    <p className="text-xs text-gray-600 text-center">
                      Generated {new Date(summary.generatedAt).toLocaleString()} · {summary.model || 'AI'}
                    </p>
                  )}
                </>
              ) : (
                <div className="card text-center py-10">
                  <Sparkles size={28} className="text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 font-medium mb-1">No AI summary yet</p>
                  <p className="text-gray-600 text-xs mb-4">Generate an AI summary to get insights</p>
                  <button onClick={handleGenerateSummary} className="btn-primary mx-auto text-sm">
                    <Sparkles size={14} /> Generate Summary
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="card space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Document Notes</h3>
                {notesDirty && <span className="text-xs text-yellow-400">Unsaved changes</span>}
              </div>
              <textarea
                value={notes}
                onChange={e => { setNotes(e.target.value); setNotesDirty(true); }}
                placeholder="Add private notes about this document..."
                rows={10}
                className="input resize-none text-sm"
                maxLength={5000}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">{notes.length}/5000 characters</span>
                <button
                  onClick={handleSaveNotes}
                  disabled={notesSaving || !notesDirty}
                  className="btn-primary text-sm"
                >
                  {notesSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Save Notes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share modal */}
      <Modal open={shareModal} onClose={() => { setShareModal(false); setShareLink(''); }} title="Share Document">
        <div className="p-6 space-y-4">
          {shareLink ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-400">Share link created:</p>
              <div className="flex gap-2">
                <input value={shareLink} readOnly className="input text-sm flex-1" />
                <button onClick={() => { navigator.clipboard.writeText(shareLink); toast.success('Copied!'); }}
                  className="btn-secondary text-sm">Copy</button>
              </div>
              <button onClick={() => setShareLink('')} className="btn-ghost text-sm">Create another</button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300">Allow download</label>
                <input type="checkbox" checked={shareSettings.allowDownload}
                  onChange={e => setShareSettings(p => ({ ...p, allowDownload: e.target.checked }))}
                  className="accent-brand-500 w-4 h-4" />
              </div>
              <div>
                <label className="label">Password (optional)</label>
                <input type="password" value={shareSettings.password}
                  onChange={e => setShareSettings(p => ({ ...p, password: e.target.value }))}
                  placeholder="Leave empty for public link" className="input" />
              </div>
              <div>
                <label className="label">Expiry date (optional)</label>
                <input type="date" value={shareSettings.expiresAt}
                  onChange={e => setShareSettings(p => ({ ...p, expiresAt: e.target.value }))}
                  className="input" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShareModal(false)} className="btn-secondary">Cancel</button>
                <button onClick={handleShare} disabled={shareLoading} className="btn-primary">
                  {shareLoading ? <Loader2 size={15} className="animate-spin" /> : <Share2 size={15} />}
                  Create Link
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
