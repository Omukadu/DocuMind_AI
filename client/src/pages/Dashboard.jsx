import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, Users, Sparkles, HardDrive, ArrowUpRight, Upload, Plus, TrendingUp, Clock } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { getWorkspaceStats } from '../services/workspaceService';
import { formatFileSize, formatRelativeTime, getFileTypeColor } from '../utils/formatters';
import FileTypeIcon from '../components/shared/FileTypeIcon';

function StatCard({ icon: Icon, label, value, sub, color = 'brand' }) {
  const colors = {
    brand: 'text-brand-400 bg-brand-400/10',
    green: 'text-green-400 bg-green-400/10',
    purple: 'text-purple-400 bg-purple-400/10',
    orange: 'text-orange-400 bg-orange-400/10',
  };
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${colors[color]} flex items-center justify-center`}>
          <Icon size={18} />
        </div>
        <TrendingUp size={14} className="text-green-400 opacity-60" />
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value ?? '—'}</div>
      <div className="text-sm text-gray-500">{label}</div>
      {sub && <div className="text-xs text-gray-600 mt-1">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { currentWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentWorkspace?._id) return;
    setLoading(true);
    getWorkspaceStats(currentWorkspace._id)
      .then(({ data }) => setStats(data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentWorkspace?._id]);

  const storagePercent = stats ? Math.min(100, Math.round((stats.storageUsed / stats.storageLimit) * 100)) : 0;
  const aiPercent = stats ? Math.min(100, Math.round((stats.aiQueriesUsed / stats.aiQueriesLimit) * 100)) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-gray-500 text-sm">
            {currentWorkspace?.name || 'Your workspace'} overview
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/upload')} className="btn-primary text-sm">
            <Upload size={15} /> Upload
          </button>
          <button onClick={() => navigate('/ai')} className="btn-secondary text-sm">
            <Sparkles size={15} /> AI Chat
          </button>
        </div>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stat-card animate-pulse">
              <div className="w-10 h-10 bg-dark-700 rounded-xl mb-4" />
              <div className="h-7 bg-dark-700 rounded w-16 mb-2" />
              <div className="h-4 bg-dark-700 rounded w-24" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard icon={FileText} label="Total Documents" value={stats?.totalDocuments} color="brand" />
          <StatCard icon={HardDrive} label="Storage Used"
            value={formatFileSize(stats?.storageUsed)} sub={`of ${formatFileSize(stats?.storageLimit)}`} color="purple" />
          <StatCard icon={Users} label="Team Members" value={stats?.totalMembers} color="green" />
          <StatCard icon={Sparkles} label="AI Queries"
            value={stats?.aiQueriesUsed} sub={`of ${stats?.aiQueriesLimit} this month`} color="orange" />
        </div>
      )}

      {/* Usage bars */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <HardDrive size={15} className="text-purple-400" /> Storage Usage
            </h3>
            <span className="text-xs text-gray-500">{storagePercent}%</span>
          </div>
          <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-brand-500 rounded-full transition-all duration-700"
              style={{ width: `${storagePercent}%` }} />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>{formatFileSize(stats?.storageUsed || 0)} used</span>
            <span>{formatFileSize(stats?.storageLimit || 0)} total</span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <Sparkles size={15} className="text-orange-400" /> AI Queries
            </h3>
            <span className="text-xs text-gray-500">{aiPercent}%</span>
          </div>
          <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full transition-all duration-700"
              style={{ width: `${aiPercent}%` }} />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>{stats?.aiQueriesUsed || 0} used</span>
            <span>{stats?.aiQueriesLimit || 0} limit</span>
          </div>
        </div>
      </div>

      {/* Recent documents */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-200 flex items-center gap-2">
            <Clock size={15} className="text-gray-500" /> Recent Documents
          </h2>
          <Link to="/documents" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
            View all <ArrowUpRight size={14} />
          </Link>
        </div>

        {!stats?.recentDocuments?.length ? (
          <div className="card text-center py-12">
            <FileText size={32} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-medium mb-2">No documents yet</p>
            <p className="text-gray-600 text-sm mb-4">Upload your first document to get started</p>
            <button onClick={() => navigate('/upload')} className="btn-primary mx-auto text-sm">
              <Upload size={14} /> Upload document
            </button>
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <div className="divide-y divide-white/5">
              {stats.recentDocuments.map(doc => (
                <div key={doc._id} onClick={() => navigate(`/documents/${doc._id}`)}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/3 transition-colors cursor-pointer group">
                  <FileTypeIcon fileType={doc.fileType} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">{doc.name}</p>
                    <p className="text-xs text-gray-500">{doc.uploadedBy?.name} · {formatRelativeTime(doc.createdAt)}</p>
                  </div>
                  <ArrowUpRight size={14} className="text-gray-600 group-hover:text-brand-400 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-base font-semibold text-gray-200 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Upload, label: 'Upload Documents', to: '/upload', color: 'brand' },
            { icon: Sparkles, label: 'AI Workspace', to: '/ai', color: 'purple' },
            { icon: FileText, label: 'Document Library', to: '/documents', color: 'blue' },
            { icon: Users, label: 'Manage Team', to: '/workspace', color: 'green' },
          ].map(({ icon: Icon, label, to, color }) => (
            <Link key={to} to={to}
              className="card-hover flex flex-col items-center gap-3 py-6 text-center">
              <div className={`w-10 h-10 rounded-xl bg-${color === 'brand' ? 'brand' : color}-400/10 flex items-center justify-center`}>
                <Icon size={18} className={`text-${color === 'brand' ? 'brand' : color}-400`} />
              </div>
              <span className="text-sm font-medium text-gray-300">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
