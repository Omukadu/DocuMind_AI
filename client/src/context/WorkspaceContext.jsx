import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as workspaceService from '../services/workspaceService';
import { useAuth } from './AuthContext';

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchWorkspaces = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await workspaceService.getWorkspaces();
      setWorkspaces(data.workspaces);
      const saved = localStorage.getItem('currentWorkspaceId');
      const ws = data.workspaces.find(w => w._id === saved) || data.workspaces[0];
      if (ws) setCurrentWorkspace(ws);
    } catch (err) {
      console.error('Failed to fetch workspaces', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchWorkspaces(); }, [fetchWorkspaces]);

  const switchWorkspace = (ws) => {
    setCurrentWorkspace(ws);
    localStorage.setItem('currentWorkspaceId', ws._id);
  };

  const createWorkspace = async (name, description) => {
    const { data } = await workspaceService.createWorkspace({ name, description });
    setWorkspaces(prev => [...prev, data.workspace]);
    switchWorkspace(data.workspace);
    return data.workspace;
  };

  const refreshWorkspaces = () => fetchWorkspaces();

  return (
    <WorkspaceContext.Provider value={{ workspaces, currentWorkspace, loading, switchWorkspace, createWorkspace, refreshWorkspaces }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspace = () => {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
};
