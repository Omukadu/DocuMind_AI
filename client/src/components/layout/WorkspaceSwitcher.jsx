import { useState } from 'react';
import { ChevronDown, Plus, Check } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import toast from 'react-hot-toast';

export default function WorkspaceSwitcher() {
  const { workspaces, currentWorkspace, switchWorkspace, createWorkspace } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await createWorkspace(newName.trim(), '');
      setNewName('');
      setCreating(false);
      setOpen(false);
      toast.success('Workspace created!');
    } catch {
      toast.error('Failed to create workspace');
    }
  };

  return (
    <div className="relative px-3 py-3 border-b border-white/5">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 border border-white/5 transition-colors"
      >
        <div className="w-6 h-6 rounded bg-gradient-to-br from-brand-600 to-purple-600 flex-shrink-0" />
        <span className="flex-1 text-left text-sm font-medium text-gray-200 truncate">
          {currentWorkspace?.name || 'Select workspace'}
        </span>
        <ChevronDown size={14} className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-3 right-3 mt-1 bg-dark-800 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-1.5 space-y-0.5 max-h-48 overflow-y-auto">
            {workspaces.map(ws => (
              <button key={ws._id}
                onClick={() => { switchWorkspace(ws); setOpen(false); }}
                className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm hover:bg-white/5 transition-colors text-left"
              >
                <div className="w-5 h-5 rounded bg-gradient-to-br from-brand-600 to-purple-600 flex-shrink-0" />
                <span className="flex-1 text-gray-200 truncate">{ws.name}</span>
                {currentWorkspace?._id === ws._id && <Check size={14} className="text-brand-400" />}
              </button>
            ))}
          </div>

          <div className="border-t border-white/5 p-2">
            {creating ? (
              <form onSubmit={handleCreate} className="flex gap-2">
                <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
                  placeholder="Workspace name" className="input text-xs py-1.5 flex-1" />
                <button type="submit" className="btn-primary text-xs py-1.5 px-3">Create</button>
              </form>
            ) : (
              <button onClick={() => setCreating(true)}
                className="flex items-center gap-2 w-full px-2.5 py-2 text-sm text-brand-400 hover:bg-brand-500/10 rounded-lg transition-colors">
                <Plus size={14} />
                New workspace
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
