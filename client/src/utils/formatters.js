export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  const now = new Date();
  const then = new Date(date);
  const diff = now - then;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
};

export const getFileIcon = (fileType) => {
  const icons = {
    pdf: '📄', word: '📝', excel: '📊', powerpoint: '📋',
    image: '🖼️', csv: '📈', text: '📃', other: '📁',
  };
  return icons[fileType] || icons.other;
};

export const getFileTypeColor = (fileType) => {
  const colors = {
    pdf: 'text-red-400 bg-red-400/10',
    word: 'text-blue-400 bg-blue-400/10',
    excel: 'text-green-400 bg-green-400/10',
    powerpoint: 'text-orange-400 bg-orange-400/10',
    image: 'text-purple-400 bg-purple-400/10',
    csv: 'text-cyan-400 bg-cyan-400/10',
    text: 'text-gray-400 bg-gray-400/10',
    other: 'text-gray-400 bg-gray-400/10',
  };
  return colors[fileType] || colors.other;
};

export const getStatusColor = (status) => {
  const colors = {
    ready: 'text-green-400 bg-green-400/10',
    processing: 'text-yellow-400 bg-yellow-400/10',
    uploading: 'text-blue-400 bg-blue-400/10',
    failed: 'text-red-400 bg-red-400/10',
  };
  return colors[status] || 'text-gray-400 bg-gray-400/10';
};

export const getRoleColor = (role) => {
  const colors = {
    owner: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    admin: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    editor: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    viewer: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
  };
  return colors[role] || colors.viewer;
};

export const truncate = (str, length = 40) => {
  if (!str) return '';
  return str.length > length ? str.slice(0, length) + '...' : str;
};
