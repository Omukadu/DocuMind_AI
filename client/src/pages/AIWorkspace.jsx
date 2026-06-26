import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Brain, Send, Plus, Trash2, Sparkles, FileText, Folder, Globe,
  Loader2, ChevronRight, MessageSquare, Copy, Check,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { createChat, getChats, getChat, sendMessage, deleteChat } from '../services/aiService';
import { getDocuments } from '../services/documentService';
import { getFolders } from '../services/folderService';
import { formatRelativeTime } from '../utils/formatters';
import toast from 'react-hot-toast';

const MODES = [
  { id: 'workspace', icon: Globe, label: 'Workspace', desc: 'Chat across all documents' },
  { id: 'document', icon: FileText, label: 'Document', desc: 'Chat with one document' },
  { id: 'folder', icon: Folder, label: 'Folder', desc: 'Chat with a folder' },
];

const SUGGESTED = [
  'Summarize the key points from recent documents',
  'What are the main risks mentioned across documents?',
  'List all action items found in the workspace',
  'What are the important dates in these documents?',
];

// MessageBubble receives onSend so follow-up chips can dispatch messages
function MessageBubble({ msg, onSend }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : ''} group`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Brain size={15} className="text-white" />
        </div>
      )}
      <div className={`max-w-[80%] space-y-2 ${isUser ? 'items-end' : ''}`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${isUser ? 'bg-brand-600/20 text-gray-200 rounded-tr-sm' : 'bg-dark-700 text-gray-300 rounded-tl-sm'}`}>
          {msg.content}
        </div>
        {!isUser && msg.sources?.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs text-gray-600 px-1">Sources:</p>
            {msg.sources.map((s, i) => (
              <div key={i} className="px-3 py-2 bg-dark-800 border border-white/5 rounded-xl text-xs text-gray-500">
                <span className="text-brand-400">Excerpt {i + 1}</span> — {s.excerpt}
              </div>
            ))}
          </div>
        )}
        {!isUser && msg.suggestedFollowUps?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {msg.suggestedFollowUps.map((q, i) => (
              <button
                key={i}
                onClick={() => onSend && onSend(q)}
                className="px-2.5 py-1 bg-dark-700 hover:bg-brand-600/20 border border-white/5 hover:border-brand-500/30 rounded-full text-xs text-gray-400 hover:text-brand-300 transition-colors cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-400 transition-colors px-1">
            {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <span className="text-gray-700 text-xs">{formatRelativeTime(msg.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

export default function AIWorkspace() {
  const { currentWorkspace } = useWorkspace();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [mode, setMode] = useState(searchParams.get('mode') || 'workspace');
  const [targetDocumentId, setTargetDocumentId] = useState(searchParams.get('documentId') || '');
  const [documents, setDocuments] = useState([]);
  const [folders, setFolders] = useState([]);

  useEffect(() => {
    if (!currentWorkspace?._id) return;
    setLoadingChats(true);
    Promise.all([
      getChats(currentWorkspace._id),
      getDocuments({ workspaceId: currentWorkspace._id, limit: 50 }),
      getFolders({ workspaceId: currentWorkspace._id, parentId: 'root' }),
    ]).then(([chatsRes, docsRes, foldersRes]) => {
      setChats(chatsRes.data.chats);
      setDocuments(docsRes.data.documents);
      setFolders(foldersRes.data.folders);
    }).catch(console.error).finally(() => setLoadingChats(false));
  }, [currentWorkspace?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNewChat = async () => {
    if (!currentWorkspace?._id) return;
    try {
      const { data } = await createChat({
        workspaceId: currentWorkspace._id, mode,
        targetDocumentId: targetDocumentId || undefined,
      });
      setChats(prev => [data.chat, ...prev]);
      setCurrentChat(data.chat);
      setMessages([]);
    } catch { toast.error('Failed to create chat'); }
  };

  const handleSelectChat = async (chat) => {
    setCurrentChat(chat);
    try {
      const { data } = await getChat(chat._id);
      setMessages(data.messages);
    } catch { toast.error('Failed to load chat'); }
  };

  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation();
    try {
      await deleteChat(chatId);
      setChats(prev => prev.filter(c => c._id !== chatId));
      if (currentChat?._id === chatId) { setCurrentChat(null); setMessages([]); }
      toast.success('Chat deleted');
    } catch { toast.error('Failed to delete chat'); }
  };

  // handleSend accepts an optional text override (for follow-up chips and SUGGESTED cards)
  const handleSend = async (text) => {
    const content = (typeof text === 'string' ? text : input).trim();
    if (!content || sending) return;

    let chat = currentChat;
    if (!chat) {
      try {
        const { data } = await createChat({
          workspaceId: currentWorkspace._id, mode,
          targetDocumentId: targetDocumentId || undefined,
        });
        chat = data.chat;
        setChats(prev => [data.chat, ...prev]);
        setCurrentChat(data.chat);
      } catch { toast.error('Failed to start chat'); return; }
    }

    setInput('');
    setSending(true);
    const tempMsg = { _id: Date.now(), role: 'user', content, createdAt: new Date() };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const { data } = await sendMessage(chat._id, content);
      setMessages(prev => [
        ...prev.filter(m => m._id !== tempMsg._id),
        data.userMessage,
        data.assistantMessage,
      ]);
      setChats(prev => prev.map(c =>
        c._id === chat._id ? { ...c, lastMessageAt: new Date(), messageCount: (c.messageCount || 0) + 2 } : c
      ));
    } catch {
      setMessages(prev => prev.filter(m => m._id !== tempMsg._id));
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-0 -mx-6 -mt-6 overflow-hidden rounded-xl border border-white/5">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 flex flex-col border-r border-white/5 bg-dark-900">
        <div className="p-4 border-b border-white/5">
          <button onClick={handleNewChat} className="btn-primary w-full justify-center text-sm">
            <Plus size={15} /> New Chat
          </button>
        </div>

        {/* Mode selector */}
        <div className="p-3 border-b border-white/5 space-y-1">
          {MODES.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setMode(id)}
              className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-colors ${mode === id ? 'bg-brand-600/15 text-brand-300' : 'text-gray-500 hover:text-gray-300 hover:bg-white/3'}`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {mode === 'document' && documents.length > 0 && (
          <div className="p-3 border-b border-white/5">
            <p className="text-xs text-gray-600 mb-2">Select document:</p>
            <select value={targetDocumentId} onChange={e => setTargetDocumentId(e.target.value)}
              className="input text-xs py-1.5">
              <option value="">All documents</option>
              {documents.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
        )}

        {mode === 'folder' && folders.length > 0 && (
          <div className="p-3 border-b border-white/5">
            <p className="text-xs text-gray-600 mb-2">Select folder:</p>
            <select value={targetDocumentId} onChange={e => setTargetDocumentId(e.target.value)}
              className="input text-xs py-1.5">
              <option value="">Select a folder</option>
              {folders.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
            </select>
          </div>
        )}

        {/* Chat history */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-2 py-1.5">Recent Chats</p>
          {loadingChats ? (
            <div className="space-y-2 px-2">
              {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-dark-700 rounded-lg animate-pulse" />)}
            </div>
          ) : chats.length === 0 ? (
            <p className="text-xs text-gray-600 px-2">No chats yet</p>
          ) : (
            chats.map(chat => (
              <button key={chat._id} onClick={() => handleSelectChat(chat)}
                className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-left transition-colors group ${currentChat?._id === chat._id ? 'bg-brand-600/10 text-brand-300' : 'text-gray-400 hover:bg-white/3 hover:text-gray-200'}`}>
                <MessageSquare size={13} className="flex-shrink-0" />
                <span className="flex-1 text-xs truncate">{chat.title}</span>
                <button onClick={e => handleDeleteChat(chat._id, e)}
                  className="p-1 rounded hover:bg-red-500/10 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={11} />
                </button>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0 bg-dark-950">
        {/* Chat header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-gray-200">
              {currentChat ? currentChat.title : `AI Workspace — ${MODES.find(m => m.id === mode)?.label}`}
            </h2>
            <p className="text-xs text-gray-600">{MODES.find(m => m.id === mode)?.desc}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-gray-500">AI Ready</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600/20 to-purple-600/20 border border-brand-500/20 flex items-center justify-center mb-5">
                <Brain size={28} className="text-brand-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">Start a conversation</h3>
              <p className="text-gray-500 text-sm mb-8 max-w-sm">
                Ask anything about your documents. I'll analyze the content and give you cited answers.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg">
                {SUGGESTED.map((q, i) => (
                  <button key={i} onClick={() => handleSend(q)}
                    className="card-hover text-left p-3.5 text-sm text-gray-400 hover:text-gray-200 flex items-start gap-2">
                    <Sparkles size={13} className="text-brand-400 mt-0.5 flex-shrink-0" />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map(msg => (
              <MessageBubble key={msg._id} msg={msg} onSend={handleSend} />
            ))
          )}
          {sending && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <Brain size={15} className="text-white" />
              </div>
              <div className="bg-dark-700 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-brand-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-white/5 flex-shrink-0">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask anything about your documents... (Enter to send, Shift+Enter for newline)"
              rows={2}
              className="input flex-1 resize-none text-sm py-3"
            />
            <button onClick={() => handleSend()} disabled={!input.trim() || sending}
              className="btn-primary px-4 self-end flex-shrink-0">
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
          <p className="text-xs text-gray-700 mt-2 text-center">
            Powered by DocuMind AI · Requires <code className="font-mono">AI_PROVIDER=gemini</code> + <code className="font-mono">GEMINI_API_KEY</code> in server/.env
          </p>
        </div>
      </div>
    </div>
  );
}
