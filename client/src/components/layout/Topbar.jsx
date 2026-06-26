import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Bell, Menu, Upload, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/documents?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  return (
    <header className="flex items-center gap-4 px-6 py-3.5 border-b border-white/5 bg-dark-900/80 backdrop-blur-sm flex-shrink-0">
      <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-gray-400">
        <Menu size={20} />
      </button>

      <form onSubmit={handleSearch} className="flex-1 max-w-lg">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text" placeholder="Search documents, folders..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-9 py-2 text-sm bg-dark-800"
          />
        </div>
      </form>

      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/upload')}
          className="hidden sm:flex btn-primary text-sm py-2">
          <Upload size={15} />
          Upload
        </button>

        <Link to="/notifications" className="relative p-2 rounded-lg hover:bg-white/5 text-gray-400 transition-colors">
          <Bell size={18} />
        </Link>

        <div className="relative">
          <button onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-52 bg-dark-800 border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden">
                <div className="p-3 border-b border-white/5">
                  <p className="text-sm font-medium text-gray-100">{user?.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                </div>
                <div className="p-1.5">
                  <button onClick={() => { navigate('/settings'); setProfileOpen(false); }} className="dropdown-item w-full">
                    <User size={15} /> Profile & Settings
                  </button>
                  <button onClick={handleLogout} className="dropdown-item w-full text-red-400 hover:text-red-300">
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
