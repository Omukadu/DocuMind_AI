import { useState } from 'react';
import { User, Shield, Bell, Palette, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'profile', icon: User, label: 'Profile' },
  { id: 'security', icon: Shield, label: 'Security' },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
  { id: 'preferences', icon: Palette, label: 'Preferences' },
];

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/users/profile', { name: profileForm.name });
      updateUser(data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    try {
      await api.put('/users/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed. Please log in again.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Tab nav */}
        <div className="flex md:flex-col gap-1 md:w-48 flex-shrink-0">
          {TABS.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${activeTab === id ? 'bg-brand-600/15 text-brand-400 border border-brand-500/20' : 'text-gray-500 hover:text-gray-300 hover:bg-white/3'}`}>
              <Icon size={15} />{label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'profile' && (
            <div className="card max-w-xl space-y-6">
              <h2 className="text-base font-semibold text-gray-200">Profile Information</h2>
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-200">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <span className="badge bg-brand-500/10 text-brand-400 mt-1">{user?.role}</span>
                </div>
              </div>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="label">Full name</label>
                  <input value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                    className="input" required />
                </div>
                <div>
                  <label className="label">Email address</label>
                  <input value={profileForm.email} readOnly className="input opacity-60 cursor-not-allowed" />
                  <p className="text-xs text-gray-600 mt-1">Email cannot be changed.</p>
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={saving} className="btn-primary">
                    {saving ? <Loader2 size={15} className="animate-spin" /> : null}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card max-w-xl space-y-5">
              <h2 className="text-base font-semibold text-gray-200">Change Password</h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="label">Current password</label>
                  <input type="password" value={pwForm.currentPassword}
                    onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                    placeholder="••••••••" className="input" required />
                </div>
                <div>
                  <label className="label">New password</label>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} value={pwForm.newPassword}
                      onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                      placeholder="Min 6 characters" className="input pr-10" required />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">Confirm new password</label>
                  <input type="password" value={pwForm.confirmPassword}
                    onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="••••••••" className="input" required />
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={saving} className="btn-primary">
                    {saving ? <Loader2 size={15} className="animate-spin" /> : null}
                    Change Password
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card max-w-xl space-y-5">
              <h2 className="text-base font-semibold text-gray-200">Notification Preferences</h2>
              {[
                { key: 'teamActivity', label: 'Team Activity', desc: 'Member joins, role changes, invitations' },
                { key: 'documentActivity', label: 'Document Activity', desc: 'Uploads, shares, deletions' },
                { key: 'aiActivity', label: 'AI Activity', desc: 'Summaries, chat responses' },
                { key: 'email', label: 'Email Notifications', desc: 'Receive notifications via email' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-200">{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </div>
                  <input type="checkbox" defaultChecked
                    className="w-4 h-4 accent-brand-500 cursor-pointer" />
                </div>
              ))}
              <div className="flex justify-end">
                <button className="btn-primary" onClick={() => toast.success('Preferences saved')}>
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="card max-w-xl space-y-5">
              <h2 className="text-base font-semibold text-gray-200">App Preferences</h2>
              <div className="space-y-4">
                <div>
                  <label className="label">Theme</label>
                  <select className="input w-40" defaultValue="dark">
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="system">System</option>
                  </select>
                </div>
                <div>
                  <label className="label">Language</label>
                  <select className="input w-40" defaultValue="en">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <button className="btn-primary" onClick={() => toast.success('Preferences saved')}>
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
