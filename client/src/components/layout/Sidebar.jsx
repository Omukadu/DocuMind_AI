import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Upload, Sparkles, FolderOpen, Share2,
  Bell, Settings, Shield, ChevronDown, Plus, X, Brain,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useState } from 'react';
import WorkspaceSwitcher from './WorkspaceSwitcher.jsx';

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/documents', icon: FileText, label: 'Documents' },
  { to: '/upload', icon: Upload, label: 'Upload Center' },
  { to: '/ai', icon: Sparkles, label: 'AI Workspace' },
  { to: '/workspace', icon: FolderOpen, label: 'Workspace' },
  { to: '/shared', icon: Share2, label: 'Shared' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      {open && <div className="fixed inset-0 z-20 bg-black/60 lg:hidden" onClick={onClose} />}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col
        bg-dark-900 border-r border-white/5
        transform transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-4.5 h-4.5 text-white" size={18} />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">DocuMind</span>
            <span className="text-brand-400 font-bold text-lg">AI</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded hover:bg-white/5 text-gray-400">
            <X size={18} />
          </button>
        </div>

        {/* Workspace switcher */}
        <WorkspaceSwitcher />

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to} onClick={onClose}
              className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}
            >
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}

          {(user?.role === 'admin' || user?.role === 'superadmin') && (
            <>
              <div className="pt-3 pb-1 px-3">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Admin</span>
              </div>
              <NavLink to="/admin" onClick={onClose}
                className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}>
                <Shield size={17} />
                <span>Admin Panel</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* User info */}
        <div className="p-3 border-t border-white/5">
          <button onClick={() => { navigate('/settings'); onClose(); }}
            className="flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-white/5 transition-colors text-left">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
