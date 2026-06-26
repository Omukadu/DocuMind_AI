import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import { WorkspaceProvider } from './context/WorkspaceContext.jsx';
import PrivateRoute from './components/shared/PrivateRoute.jsx';
import AppLayout from './layouts/AppLayout.jsx';

import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DocumentLibrary from './pages/DocumentLibrary.jsx';
import DocumentViewer from './pages/DocumentViewer.jsx';
import UploadCenter from './pages/UploadCenter.jsx';
import AIWorkspace from './pages/AIWorkspace.jsx';
import AISummaryCenter from './pages/AISummaryCenter.jsx';
import WorkspaceManagement from './pages/WorkspaceManagement.jsx';
import SharedDocuments from './pages/SharedDocuments.jsx';
import SharedAccess from './pages/SharedAccess.jsx';
import Notifications from './pages/Notifications.jsx';
import Settings from './pages/Settings.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WorkspaceProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { background: '#1e1e40', color: '#f3f4f6', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '14px' },
              success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
            }}
          />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/shared/:token" element={<SharedAccess />} />

            <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/documents" element={<DocumentLibrary />} />
              <Route path="/documents/:id" element={<DocumentViewer />} />
              <Route path="/upload" element={<UploadCenter />} />
              <Route path="/ai" element={<AIWorkspace />} />
              <Route path="/ai/summary/:documentId" element={<AISummaryCenter />} />
              <Route path="/workspace" element={<WorkspaceManagement />} />
              <Route path="/shared" element={<SharedDocuments />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </WorkspaceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
