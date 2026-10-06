import React, { useState, useEffect, useRef } from 'react';
import {
  X, Send, MessageSquare, AlertCircle,
  Check, CheckCheck, Reply, Paperclip,
  Image as ImageIcon, FileText, Video, Mic,
  Smile
} from 'lucide-react';
import api from '../services/api';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  senderEmail: string;
  recipientEmail: string;
  recipientName?: string;
  internshipTitle?: string;
}

const EMOJIS = ['😊', '😂', '❤️', '👍', '🔥', '🙌', '✨', '🤔', '🎉', '🚀', '✅', '🙏'];

const ChatStyles = () => (
  <style>{`
    .chat-modal {
      --blue: #ea580c;
      --blue-50: #eff6ff;
      --blue-100: #e0e7ff;
      --blue-700: #4f46e5;
      --slate-50: #f8fafc;
      --slate-100: #f1f5f9;
      --slate-200: #e2e8f0;
      --slate-300: #cbd5e1;
      --slate-400: #94a3b8;
      --slate-500: #64748b;
      --slate-600: #475569;
      --slate-700: #334155;
      --slate-800: #1e293b;
      --slate-900: #0f172a;
      --green: #10b981;
      --radius: 14px;
      --radius-sm: 10px;

      position: relative !important;
      z-index: 10 !important;
      width: 100% !important;
      max-width: 480px !important;
      height: 650px !important;
      max-height: 88vh !important;
      background: #ffffff !important;
      border-radius: 24px !important;
      box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.4) !important;
      display: flex !important;
      flex-direction: column !important;
      overflow: hidden !important;
      border: 1px solid #e2e8f0 !important;
      animation: chatModalPop 0.22s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }
    @keyframes chatModalPop {
      from { opacity: 0; transform: scale(0.95) translateY(12px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .chat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 18px;
      border-bottom: 1px solid var(--slate-100);
      background: #ffffff;
      flex-shrink: 0;
    }
    .chat-header-info { display: flex; align-items: center; gap: 12px; }
    .chat-avatar {
      width: 42px;
      height: 42px;
      border-radius: 11px;
      background: #ea580c;
      color: #ffffff !important;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: 800;
      text-transform: uppercase;
      flex-shrink: 0;
      box-shadow: 0 2px 4px rgba(99,102,241,0.25);
    }
    .chat-name { font-size: 14px; font-weight: 800; color: #0f172a; line-height: 1.2; }
    .chat-status {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 10px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 3px;
    }
    .chat-status-dot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; flex-shrink: 0; }

    .chat-body {
      flex: 1;
      overflow-y: auto;
      padding: 18px;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .chat-row { display: flex; flex-direction: column; }
    .chat-row.mine { align-items: flex-end; }
    .chat-row.theirs { align-items: flex-start; }

    .chat-reply-preview {
      font-size: 10px;
      font-weight: 600;
      padding: 6px 10px;
      border-radius: 8px 8px 0 0;
      max-width: 75%;
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: -4px;
    }
    .chat-reply-preview.mine { background: #e0e7ff; color: #4338ca; }
    .chat-reply-preview.theirs { background: #e2e8f0; color: #475569; }

    .chat-bubble-wrap { display: flex; align-items: flex-end; gap: 6px; max-width: 78%; }
    .chat-bubble-wrap.mine { flex-direction: row-reverse; }

    .chat-bubble {
      padding: 10px 13px;
      border-radius: 14px;
      font-size: 13px;
      line-height: 1.55;
      box-shadow: 0 1px 2px rgba(15,23,42,0.04);
    }
    .chat-bubble.mine { background: #ea580c !important; color: #ffffff !important; border-radius: 14px 14px 4px 14px; }
    .chat-bubble.theirs { background: #ffffff !important; color: #0f172a !important; border: 1px solid #e2e8f0; border-radius: 14px 14px 14px 4px; }

    .chat-meta { display: flex; align-items: center; justify-content: flex-end; gap: 4px; margin-top: 4px; }
    .chat-meta-time { font-size: 10px; font-weight: 600; }
    .chat-meta-time.mine { color: rgba(255, 255, 255, 0.9) !important; }
    .chat-meta-time.theirs { color: #94a3b8 !important; }

    .chat-reply-btn {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      border: none;
      background: transparent;
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      opacity: 0;
      transition: opacity 0.15s, background 0.15s, color 0.15s;
    }
    .chat-bubble-wrap:hover .chat-reply-btn { opacity: 1; }
    .chat-reply-btn:hover { background: #e2e8f0; color: #475569; }

    .chat-doc-link {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(0,0,0,0.05);
      border: 1px solid rgba(0,0,0,0.06);
      border-radius: 10px;
      padding: 9px 10px;
      text-decoration: none;
      color: inherit;
    }
    .chat-doc-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: #ea580c;
    }
    .chat-doc-link p:first-child { font-size: 12px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px; }
    .chat-doc-link p:last-child { font-size: 10px; opacity: 0.6; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }

    .chat-input-area { border-top: 1px solid #f1f5f9; padding: 14px 16px; background: #ffffff; flex-shrink: 0; }
    .chat-reply-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #eff6ff;
      border: 1px solid #dbeafe;
      border-radius: 10px;
      padding: 8px 10px;
      margin-bottom: 10px;
    }
    .chat-reply-bar-text p:first-child { font-size: 10px; font-weight: 700; color: #ea580c; text-transform: uppercase; letter-spacing: 0.04em; }
    .chat-reply-bar-text p:last-child { font-size: 12px; font-weight: 600; color: #475569; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 280px; }
    .chat-reply-bar button { border: none; background: transparent; color: #ea580c; cursor: pointer; padding: 2px; }

    .chat-controls { display: flex; align-items: center; gap: 6px; }
    .chat-icon-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: none;
      background: #f8fafc;
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      position: relative;
      transition: background 0.15s, color 0.15s;
    }
    .chat-icon-btn:hover { background: #f1f5f9; color: #475569; }
    .chat-icon-btn.active { background: #ea580c; color: #ffffff; }

    .chat-popover {
      position: absolute;
      bottom: calc(100% + 8px);
      left: 0;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.1);
      z-index: 20;
    }
    .chat-emoji-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; padding: 10px; }
    .chat-emoji-grid button { font-size: 20px; border: none; background: transparent; cursor: pointer; padding: 4px; border-radius: 6px; }
    .chat-emoji-grid button:hover { background: #f8fafc; }

    .chat-attach-menu { display: flex; flex-direction: column; padding: 6px; min-width: 150px; }
    .chat-attach-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      border-radius: 10px;
      border: none;
      background: transparent;
      cursor: pointer;
      text-align: left;
      width: 100%;
    }
    .chat-attach-item:hover { background: #eff6ff; }
    .chat-attach-icon {
      width: 28px;
      height: 28px;
      border-radius: 7px;
      background: #f8fafc;
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .chat-attach-item:hover .chat-attach-icon { background: #ea580c; color: #ffffff; }
    .chat-attach-item span { font-size: 12px; font-weight: 600; color: #475569; }
    .chat-attach-item:hover span { color: #ea580c; }

    .chat-input-row { flex: 1; position: relative; }
    .chat-input-row input {
      width: 100%;
      height: 38px;
      padding: 0 42px 0 14px;
      border-radius: 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      outline: none;
      font-size: 13px;
      color: #0f172a;
      transition: border-color 0.15s, background 0.15s;
    }
    .chat-input-row input:focus { border-color: #ea580c; background: #ffffff; }
    .chat-send-btn {
      position: absolute;
      right: 4px;
      top: 50%;
      transform: translateY(-50%);
      width: 30px;
      height: 30px;
      border-radius: 8px;
      background: #ea580c;
      color: #ffffff;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.15s;
    }
    .chat-send-btn:disabled { background: #e2e8f0; color: #94a3b8; cursor: not-allowed; }
    .chat-send-btn:not(:disabled):hover { background: #4f46e5; }
  `}</style>
);

const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  senderEmail,
  recipientEmail,
  recipientName,
  internshipTitle
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<any | null>(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && recipientEmail) {
      fetchChatHistory();
      const interval = setInterval(fetchChatHistory, 5000); // Poll every 5s
      return () => clearInterval(interval);
    }
  }, [isOpen, recipientEmail]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchChatHistory = async () => {
    try {
      const response = await api.get(`/chats/history?user1=${senderEmail}&user2=${recipientEmail}`);
      setMessages(response.data || []);
      setError(null);
    } catch (error: any) {
      console.error("Error fetching chat history:", error);
      if (error.response?.status === 503) {
        setError("Chat service is currently unavailable.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, type: string = 'TEXT', fileUrl?: string, fileName?: string) => {
    e?.preventDefault();
    if (!newMessage.trim() && !fileUrl) return;

    const messageData = {
      senderEmail,
      recipientEmail,
      content: newMessage,
      messageType: type,
      fileUrl: fileUrl,
      fileName: fileName,
      replyToId: replyTo?.id
    };

    try {
      const response = await api.post('/chats/send', messageData);
      setMessages([...messages, response.data]);
      setNewMessage('');
      setReplyTo(null);
      setShowEmojis(false);
      setShowAttachments(false);
    } catch (error) {
      alert('Failed to send message');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/chats/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { fileUrl, fileName, messageType } = response.data;
      handleSendMessage(undefined, messageType, fileUrl, fileName);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    }
  };

  const openFilePicker = (type: string) => {
    if (fileInputRef.current) {
      switch (type) {
        case 'IMAGE': fileInputRef.current.accept = 'image/*'; break;
        case 'VIDEO': fileInputRef.current.accept = 'video/*'; break;
        case 'AUDIO': fileInputRef.current.accept = 'audio/*'; break;
        default: fileInputRef.current.accept = '*/*'; break;
      }
      fileInputRef.current.click();
    }
    setShowAttachments(false);
  };

  const renderMessageContent = (msg: any) => {
    const fullFileUrl = msg.fileUrl ? `${api.defaults.baseURL}${msg.fileUrl}` : null;

    switch (msg.messageType) {
      case 'IMAGE':
        return (
          <img
            src={fullFileUrl || ''}
            alt="sent"
            style={{ maxWidth: '100%', borderRadius: '8px', cursor: 'pointer', display: 'block' }}
            onClick={() => window.open(fullFileUrl || '', '_blank')}
          />
        );
      case 'VIDEO':
        return <video src={fullFileUrl || ''} controls style={{ maxWidth: '100%', borderRadius: '8px', display: 'block' }} />;
      case 'AUDIO':
        return <audio src={fullFileUrl || ''} controls style={{ maxWidth: '100%', display: 'block' }} />;
      case 'DOCUMENT':
        return (
          <a href={fullFileUrl || ''} target="_blank" rel="noopener noreferrer" className="chat-doc-link">
            <div className="chat-doc-icon"><FileText size={16} /></div>
            <div>
              <p>{msg.fileName || 'Document'}</p>
              <p>Click to view</p>
            </div>
          </a>
        );
      default:
        return <span>{msg.content}</span>;
    }
  };

  if (!isOpen) return null;

  // Guard against "undefined" or broken placeholders when no profile name is available
  const cleanName = recipientName && !/undefined|Faculty me/i.test(recipientName.trim()) ? recipientName.trim() : '';
  const displayName = cleanName || (recipientEmail ? recipientEmail.split('@')[0] : 'Faculty Supervisor');
  const avatarLetter = (displayName ? displayName.charAt(0) : 'F').toUpperCase();

  return (
    <div className="modal-overlay">
      <ChatStyles />
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal chat-modal">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-avatar">{avatarLetter}</div>
            <div>
              <div className="chat-name">{displayName}</div>
              <div className="chat-status">
                <span className="chat-status-dot" />
                {internshipTitle || 'Direct message'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900/90 hover:bg-slate-200 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Close Popup"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div ref={scrollRef} className="chat-body">
          {loading && messages.length === 0 ? (
            <div className="spinner" />
          ) : error ? (
            <div className="empty-state" style={{ border: 'none', background: 'transparent', margin: 'auto' }}>
              <AlertCircle />
              <div className="empty-state-sub">{error}</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="empty-state" style={{ border: 'none', background: 'transparent', margin: 'auto' }}>
              <MessageSquare />
              <div className="empty-state-title">No messages yet</div>
              <div className="empty-state-sub">Say hello to start the conversation.</div>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const mine = msg.senderEmail === senderEmail;
              const msgDate = new Date(msg.timestamp);
              const prevMsgDate = idx > 0 ? new Date(messages[idx - 1].timestamp) : null;
              const showDateDivider = !prevMsgDate || msgDate.toDateString() !== prevMsgDate.toDateString();

              const formatDateStr = (d: Date) => {
                const now = new Date();
                if (d.toDateString() === now.toDateString()) return 'Today';
                const yest = new Date(now);
                yest.setDate(now.getDate() - 1);
                if (d.toDateString() === yest.toDateString()) return 'Yesterday';
                return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
              };

              const formatTimeOnly = (d: Date) => {
                return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              };

              return (
                <div key={idx} style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                  {showDateDivider && (
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', margin: '12px 0' }}>
                      <span style={{ background: 'rgba(0,0,0,0.06)', color: '#475569', fontSize: '10px', fontWeight: 800, padding: '3px 12px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {formatDateStr(msgDate)}
                      </span>
                    </div>
                  )}

                  <div className={`chat-row ${mine ? 'mine' : 'theirs'}`}>
                    {msg.repliedToMessage && (
                      <div className={`chat-reply-preview ${mine ? 'mine' : 'theirs'}`}>
                        <Reply size={11} />
                        {msg.repliedToMessage.content?.substring(0, 24)}…
                      </div>
                    )}
                    <div className={`chat-bubble-wrap ${mine ? 'mine' : ''}`}>
                      <div className={`chat-bubble ${mine ? 'mine' : 'theirs'}`}>
                        {renderMessageContent(msg)}
                        <div className="chat-meta">
                          <span className={`chat-meta-time ${mine ? 'mine' : 'theirs'}`}>
                            {formatTimeOnly(msgDate)}
                          </span>
                          {mine && (
                            msg.status === 'SEEN' ? <CheckCheck size={12} color="rgba(255,255,255,0.85)" /> : <Check size={12} color="rgba(255,255,255,0.6)" />
                          )}
                        </div>
                      </div>
                      <button className="chat-reply-btn" onClick={() => setReplyTo(msg)}>
                        <Reply size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input area */}
        <div className="chat-input-area">
          {replyTo && (
            <div className="chat-reply-bar">
              <div className="chat-reply-bar-text">
                <p>Replying to message</p>
                <p>{replyTo.content}</p>
              </div>
              <button onClick={() => setReplyTo(null)}><X size={14} /></button>
            </div>
          )}

          <div className="chat-controls">
            <div style={{ position: 'relative' }}>
              <button className={`chat-icon-btn ${showEmojis ? 'active' : ''}`} onClick={() => setShowEmojis(!showEmojis)}>
                <Smile size={16} />
              </button>
              {showEmojis && (
                <div className="chat-popover">
                  <div className="chat-emoji-grid">
                    {EMOJIS.map(e => (
                      <button key={e} onClick={() => setNewMessage(prev => prev + e)}>{e}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <button className={`chat-icon-btn ${showAttachments ? 'active' : ''}`} onClick={() => setShowAttachments(!showAttachments)}>
                <Paperclip size={16} />
              </button>
              {showAttachments && (
                <div className="chat-popover">
                  <div className="chat-attach-menu">
                    <AttachmentBtn icon={<ImageIcon size={14} />} label="Photo" onClick={() => openFilePicker('IMAGE')} />
                    <AttachmentBtn icon={<Video size={14} />} label="Video" onClick={() => openFilePicker('VIDEO')} />
                    <AttachmentBtn icon={<Mic size={14} />} label="Audio" onClick={() => openFilePicker('AUDIO')} />
                    <AttachmentBtn icon={<FileText size={14} />} label="Document" onClick={() => openFilePicker('DOCUMENT')} />
                  </div>
                </div>
              )}
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
            </div>

            <form onSubmit={handleSendMessage} className="chat-input-row">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message…"
              />
              <button type="submit" className="chat-send-btn" disabled={!newMessage.trim()}>
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const AttachmentBtn = ({ icon, label, onClick }: { icon: any, label: string, onClick: () => void }) => (
  <button onClick={onClick} className="chat-attach-item">
    <div className="chat-attach-icon">{icon}</div>
    <span>{label}</span>
  </button>
);

export default ChatModal;