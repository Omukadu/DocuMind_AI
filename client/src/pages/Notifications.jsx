import { useEffect, useState } from 'react';
import { Bell, Check, CheckCheck, Trash2, Users, FileText, Sparkles, Shield, Loader2 } from 'lucide-react';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../services/notificationService';
import { formatRelativeTime } from '../utils/formatters';
import EmptyState from '../components/shared/EmptyState';
import toast from 'react-hot-toast';

const typeConfig = {
  team_activity: { icon: Users, color: 'text-blue-400 bg-blue-400/10' },
  document_activity: { icon: FileText, color: 'text-green-400 bg-green-400/10' },
  ai_activity: { icon: Sparkles, color: 'text-purple-400 bg-purple-400/10' },
  security: { icon: Shield, color: 'text-red-400 bg-red-400/10' },
  system: { icon: Bell, color: 'text-gray-400 bg-gray-400/10' },
};

const TYPES = [
  { id: '', label: 'All' },
  { id: 'team_activity', label: 'Team' },
  { id: 'document_activity', label: 'Documents' },
  { id: 'ai_activity', label: 'AI' },
  { id: 'security', label: 'Security' },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeType, setActiveType] = useState('');

  const load = async (type = activeType) => {
    setLoading(true);
    try {
      const { data } = await getNotifications({ type: type || undefined, limit: 50 });
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleMarkRead = async (id) => {
    await markAsRead(id);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    toast.success('All notifications marked as read');
  };

  const handleDelete = async (id) => {
    await deleteNotification(id);
    setNotifications(prev => prev.filter(n => n._id !== id));
    toast.success('Notification deleted');
  };

  const handleTypeFilter = (type) => {
    setActiveType(type);
    load(type);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-brand-400 mt-0.5">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-secondary text-sm">
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      {/* Type filters */}
      <div className="flex gap-2 flex-wrap">
        {TYPES.map(({ id, label }) => (
          <button key={id} onClick={() => handleTypeFilter(id)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${activeType === id ? 'bg-brand-600/20 text-brand-400 border border-brand-500/20' : 'bg-dark-800 text-gray-500 hover:text-gray-300 border border-white/5'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="card animate-pulse h-20" />)}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="divide-y divide-white/5">
            {notifications.map(notif => {
              const { icon: Icon, color } = typeConfig[notif.type] || typeConfig.system;
              return (
                <div key={notif._id}
                  className={`flex items-start gap-4 px-5 py-4 transition-colors ${notif.isRead ? 'hover:bg-white/2' : 'bg-brand-500/3 hover:bg-brand-500/5'}`}>
                  <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${notif.isRead ? 'text-gray-300' : 'text-white'}`}>
                      {notif.title}
                      {!notif.isRead && <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-brand-400" />}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
                    <p className="text-xs text-gray-700 mt-1">{formatRelativeTime(notif.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {!notif.isRead && (
                      <button onClick={() => handleMarkRead(notif._id)}
                        className="p-1.5 rounded hover:bg-white/5 text-gray-600 hover:text-green-400 transition-colors"
                        title="Mark as read">
                        <Check size={14} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(notif._id)}
                      className="p-1.5 rounded hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
