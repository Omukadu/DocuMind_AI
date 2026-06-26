import { useEffect, useState } from 'react';
import { Users, Building2, BarChart3, ClipboardList, Shield, TrendingUp, Loader2, Check, X, ChevronDown } from 'lucide-react';
import { getAdminUsers, updateAdminUser, getAdminWorkspaces, getAnalytics, getAuditLogs } from '../services/adminService';
import { formatDate, formatRelativeTime, getRoleColor } from '../utils/formatters';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  { id: 'users', icon: Users, label: 'Users' },
  { id: 'workspaces', icon: Building2, label: 'Workspaces' },
  { id: 'audit', icon: ClipboardList, label: 'Audit Logs' },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (activeTab === 'analytics') {
          const { data } = await getAnalytics();
          setAnalytics(data.analytics);
        } else if (activeTab === 'users') {
          const { data } = await getAdminUsers({ limit: 50 });
          setUsers(data.users);
        } else if (activeTab === 'workspaces') {
          const { data } = await getAdminWorkspaces();
          setWorkspaces(data.workspaces);
        } else if (activeTab === 'audit') {
          const { data } = await getAuditLogs({ limit: 50 });
          setAuditLogs(data.logs);
        }
      } catch { toast.error('Failed to load data'); }
      finally { setLoading(false); }
    };
    load();
  }, [activeTab]);

  const handleToggleUser = async (userId, isActive) => {
    try {
      await updateAdminUser(userId, { isActive: !isActive });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !isActive } : u));
      toast.success(`User ${isActive ? 'deactivated' : 'activated'}`);
    } catch { toast.error('Failed to update user'); }
  };

  const filteredUsers = users.filter(u =>
    !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
          <Shield size={18} className="text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">Platform management and analytics</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-800 border border-white/5 rounded-xl p-1 w-fit overflow-x-auto">
        {TABS.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === id ? 'bg-brand-600/20 text-brand-400' : 'text-gray-500 hover:text-gray-300'}`}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="text-brand-400 animate-spin" />
        </div>
      ) : (
        <>
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: 'Total Users', value: analytics.totalUsers, sub: `+${analytics.newUsersLast7} this week`, color: 'text-brand-400 bg-brand-400/10' },
                  { label: 'Active Users (30d)', value: analytics.activeUsers, color: 'text-green-400 bg-green-400/10' },
                  { label: 'Total Workspaces', value: analytics.totalWorkspaces, color: 'text-purple-400 bg-purple-400/10' },
                  { label: 'Total Documents', value: analytics.totalDocuments, sub: `+${analytics.newDocsLast7} this week`, color: 'text-orange-400 bg-orange-400/10' },
                ].map(({ label, value, sub, color }) => (
                  <div key={label} className="stat-card">
                    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
                      <TrendingUp size={18} />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{value?.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">{label}</div>
                    {sub && <div className="text-xs text-green-400 mt-1">{sub}</div>}
                  </div>
                ))}
              </div>

              {analytics.userGrowth?.length > 0 && (
                <div className="card">
                  <h3 className="text-sm font-semibold text-gray-300 mb-4">User Registration (Last 30 Days)</h3>
                  <div className="flex items-end gap-1 h-32">
                    {analytics.userGrowth.slice(-14).map((day, i) => {
                      const max = Math.max(...analytics.userGrowth.map(d => d.count));
                      const pct = max > 0 ? (day.count / max) * 100 : 0;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full bg-brand-500/20 rounded-sm hover:bg-brand-500/40 transition-colors"
                            style={{ height: `${Math.max(4, pct)}%` }}
                            title={`${day._id}: ${day.count} new users`} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
                placeholder="Search users by name or email..." className="input max-w-sm" />
              <div className="card p-0 overflow-hidden">
                <div className="divide-y divide-white/5">
                  {filteredUsers.map(u => (
                    <div key={u._id} className="flex items-center gap-4 px-5 py-4">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                        <p className="text-xs text-gray-600">Joined {formatDate(u.createdAt)} · Last login {u.lastLogin ? formatRelativeTime(u.lastLogin) : 'never'}</p>
                      </div>
                      <span className={`badge border ${getRoleColor(u.role)}`}>{u.role}</span>
                      <button onClick={() => handleToggleUser(u._id, u.isActive)}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${u.isActive ? 'text-green-400 bg-green-400/10 border-green-400/20 hover:bg-red-400/10 hover:text-red-400 hover:border-red-400/20' : 'text-red-400 bg-red-400/10 border-red-400/20 hover:bg-green-400/10 hover:text-green-400 hover:border-green-400/20'}`}>
                        {u.isActive ? <><Check size={11} /> Active</> : <><X size={11} /> Inactive</>}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'workspaces' && (
            <div className="card p-0 overflow-hidden">
              <div className="divide-y divide-white/5">
                {workspaces.map(ws => (
                  <div key={ws._id} className="flex items-center gap-4 px-5 py-4">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-purple-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200">{ws.name}</p>
                      <p className="text-xs text-gray-500">Owner: {ws.owner?.name} · Created {formatDate(ws.createdAt)}</p>
                    </div>
                    <span className={`badge ${ws.plan === 'enterprise' ? 'text-yellow-400 bg-yellow-400/10' : ws.plan === 'pro' ? 'text-purple-400 bg-purple-400/10' : 'text-gray-400 bg-gray-400/10'}`}>
                      {ws.plan}
                    </span>
                    <span className={`badge ${ws.isActive ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                      {ws.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="card p-0 overflow-hidden">
              <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
                {auditLogs.map(log => (
                  <div key={log._id} className="flex items-start gap-4 px-5 py-3.5 hover:bg-white/2 transition-colors">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${log.success ? 'bg-green-400' : 'bg-red-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-brand-400">{log.action}</span>
                        <span className="text-xs text-gray-600">→</span>
                        <span className="text-xs text-gray-500">{log.resource}</span>
                        {log.resourceName && <span className="text-xs text-gray-600 truncate max-w-xs">{log.resourceName}</span>}
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {log.user?.name || 'System'} · {log.workspace?.name || 'Global'} · {formatRelativeTime(log.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                {auditLogs.length === 0 && <p className="text-gray-500 text-sm px-5 py-8">No audit logs found</p>}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
