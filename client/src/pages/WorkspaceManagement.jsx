import { useEffect, useState } from 'react';
import { Users, UserPlus, Shield, Settings, Loader2, Trash2, ChevronDown } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
import { getWorkspaceMembers, inviteMember, updateMemberRole, removeMember, updateWorkspace } from '../services/workspaceService';
import { getRoleColor, formatDate, formatRelativeTime } from '../utils/formatters';
import Modal from '../components/shared/Modal';
import toast from 'react-hot-toast';

const ROLES = ['owner', 'admin', 'editor', 'viewer'];

export default function WorkspaceManagement() {
  const { currentWorkspace, refreshWorkspaces } = useWorkspace();
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'viewer' });
  const [inviting, setInviting] = useState(false);
  const [activeTab, setActiveTab] = useState('members');
  const [wsSettings, setWsSettings] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentWorkspace?._id) return;
    setWsSettings({ name: currentWorkspace.name || '', description: currentWorkspace.description || '' });
    setLoading(true);
    getWorkspaceMembers(currentWorkspace._id)
      .then(({ data }) => setMembers(data.members))
      .catch(() => toast.error('Failed to load members'))
      .finally(() => setLoading(false));
  }, [currentWorkspace?._id]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    try {
      const { data } = await inviteMember(currentWorkspace._id, inviteForm);
      setMembers(prev => [...prev, data.member]);
      setInviteModal(false);
      setInviteForm({ email: '', role: 'viewer' });
      toast.success('Member invited!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to invite member');
    } finally { setInviting(false); }
  };

  const handleRoleChange = async (memberId, userId, newRole) => {
    try {
      await updateMemberRole(currentWorkspace._id, userId, newRole);
      setMembers(prev => prev.map(m => m._id === memberId ? { ...m, role: newRole } : m));
      toast.success('Role updated');
    } catch { toast.error('Failed to update role'); }
  };

  const handleRemove = async (userId) => {
    if (!confirm('Remove this member from the workspace?')) return;
    try {
      await removeMember(currentWorkspace._id, userId);
      setMembers(prev => prev.filter(m => m.user._id !== userId));
      toast.success('Member removed');
    } catch { toast.error('Failed to remove member'); }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateWorkspace(currentWorkspace._id, wsSettings);
      await refreshWorkspaces();
      toast.success('Workspace settings saved');
    } catch { toast.error('Failed to save settings'); }
    finally { setSaving(false); }
  };

  const canManage = ['owner', 'admin'].includes(currentWorkspace?.role);

  const tabs = [
    { id: 'members', icon: Users, label: 'Members' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Workspace Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">{currentWorkspace?.name}</p>
        </div>
        {canManage && (
          <button onClick={() => setInviteModal(true)} className="btn-primary text-sm">
            <UserPlus size={15} /> Invite Member
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-800 border border-white/5 rounded-xl p-1 w-fit">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === id ? 'bg-brand-600/20 text-brand-400' : 'text-gray-500 hover:text-gray-300'}`}>
            <Icon size={15} />{label}
          </button>
        ))}
      </div>

      {activeTab === 'members' && (
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
              <Users size={15} className="text-gray-500" /> Members ({members.length})
            </h2>
          </div>
          {loading ? (
            <div className="divide-y divide-white/5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-dark-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-dark-700 rounded w-40" />
                    <div className="h-3 bg-dark-700 rounded w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {members.map(member => (
                <div key={member._id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/2 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    {member.user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200">{member.user?.name}
                      {member.user?._id === user?._id && <span className="ml-2 text-xs text-gray-600">(you)</span>}
                    </p>
                    <p className="text-xs text-gray-500">{member.user?.email}</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Joined {formatRelativeTime(member.joinedAt)} · Last seen {member.user?.lastLogin ? formatRelativeTime(member.user.lastLogin) : 'never'}
                    </p>
                  </div>
                  <span className={`badge border ${getRoleColor(member.role)}`}>{member.role}</span>
                  {canManage && member.role !== 'owner' && (
                    <div className="flex items-center gap-2">
                      <select value={member.role} onChange={e => handleRoleChange(member._id, member.user._id, e.target.value)}
                        className="input text-xs py-1.5 w-24 bg-dark-700">
                        {ROLES.filter(r => r !== 'owner').map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      {member.user?._id !== user?._id && (
                        <button onClick={() => handleRemove(member.user._id)}
                          className="p-1.5 rounded hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="card max-w-2xl space-y-5">
          <h2 className="text-base font-semibold text-gray-200">Workspace Settings</h2>
          <div>
            <label className="label">Workspace Name</label>
            <input value={wsSettings.name} onChange={e => setWsSettings(p => ({ ...p, name: e.target.value }))}
              placeholder="Workspace name" className="input" required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea value={wsSettings.description} onChange={e => setWsSettings(p => ({ ...p, description: e.target.value }))}
              placeholder="Optional description" rows={3} className="input resize-none" />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving || !canManage} className="btn-primary">
              {saving ? <Loader2 size={15} className="animate-spin" /> : null}
              Save Changes
            </button>
          </div>
          {!canManage && <p className="text-xs text-gray-600">Only owners and admins can modify workspace settings.</p>}
        </form>
      )}

      {/* Invite modal */}
      <Modal open={inviteModal} onClose={() => setInviteModal(false)} title="Invite Member">
        <form onSubmit={handleInvite} className="p-6 space-y-4">
          <div>
            <label className="label">Email address</label>
            <input type="email" required value={inviteForm.email}
              onChange={e => setInviteForm(p => ({ ...p, email: e.target.value }))}
              placeholder="colleague@example.com" className="input" />
            <p className="text-xs text-gray-600 mt-1.5">The user must already have a DocuMind AI account.</p>
          </div>
          <div>
            <label className="label">Role</label>
            <select value={inviteForm.role} onChange={e => setInviteForm(p => ({ ...p, role: e.target.value }))}
              className="input">
              <option value="viewer">Viewer — can view documents</option>
              <option value="editor">Editor — can upload and edit</option>
              <option value="admin">Admin — full workspace access</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setInviteModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={inviting} className="btn-primary">
              {inviting ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
              Send Invite
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
