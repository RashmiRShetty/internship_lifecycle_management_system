import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  MessageSquare,
  Search,
  Send,
  Paperclip,
  FileText,
  Smile,
  CheckCheck,
  Plus,
  X,
  Sparkles,
  ChevronRight,
  GraduationCap,
  UserCheck,
  Clock,
  SendHorizontal,
  Users,
  Check,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';

interface MessagesViewProps {
  userEmail: string;
  userRole?: string;
  onSelectChat?: (recipient: any) => void;
}

const EMOJIS = ['😊', '😂', '❤️', '👍', '🔥', '🙌', '✨', '🤔', '🎉', '🚀', '✅', '🙏', '💡', '👏', '🎯', '💯'];

const formatRealName = (email: string, firstName?: string, lastName?: string) => {
  if (firstName && lastName && firstName.trim() && lastName.trim()) {
    return `${firstName.trim()} ${lastName.trim()}`;
  }
  if (firstName && firstName.trim()) {
    return firstName.trim();
  }
  if (!email) return 'User';
  const namePart = email.split('@')[0];
  const cleanPart = namePart.replace(/\d+$/, '');
  const formatted = cleanPart
    .replace(/[._]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (l) => l.toUpperCase());
  return formatted || namePart;
};

const MessagesView: React.FC<MessagesViewProps> = ({ userEmail, userRole, onSelectChat }) => {
  const location = useLocation();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeRecipient, setActiveRecipient] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<any | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [newRecipientEmail, setNewRecipientEmail] = useState('');

  const [contacts, setContacts] = useState<any[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [filterMode, setFilterMode] = useState<'ALL' | 'UNREAD' | 'READ' | 'FACULTY' | 'STUDENT' | 'GROUPS'>('ALL');
  const [profileMap, setProfileMap] = useState<Record<string, any>>({});

  // Group creation state
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupTitle, setGroupTitle] = useState('');
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([]);
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [groupFilterTab, setGroupFilterTab] = useState<'SELECTED_INTERNS' | 'ALL'>('SELECTED_INTERNS');

  // Deletion confirm modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if current user is a student
  const isStudent = userRole?.toUpperCase() === 'STUDENT' || location.pathname.includes('/student');

  // REFS for selection lock
  const activeRecipientRef = useRef<string | null>(null);
  const activeGroupRef = useRef<any | null>(null);
  const isComposingRef = useRef<boolean>(false);
  const initialAutoSelectDoneRef = useRef<boolean>(false);

  useEffect(() => {
    activeRecipientRef.current = activeRecipient;
  }, [activeRecipient]);

  useEffect(() => {
    activeGroupRef.current = activeGroup;
  }, [activeGroup]);

  useEffect(() => {
    isComposingRef.current = isComposing;
  }, [isComposing]);

  // Initial recipient check from navigation state
  useEffect(() => {
    const navState = location.state as { recipientEmail?: string } | null;
    if (navState?.recipientEmail && navState.recipientEmail.toLowerCase() !== userEmail.toLowerCase()) {
      setActiveRecipient(navState.recipientEmail);
      setActiveGroup(null);
      setIsComposing(false);
      initialAutoSelectDoneRef.current = true;
    }
  }, [location, userEmail]);

  useEffect(() => {
    if (!userEmail) return;
    fetchConversations();
    fetchContacts();
    loadSavedGroups();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [userEmail]);

  useEffect(() => {
    if (activeGroup) {
      fetchGroupMessages(activeGroup.id);
      const interval = setInterval(() => fetchGroupMessages(activeGroup.id), 4000);
      return () => clearInterval(interval);
    } else if (activeRecipient) {
      fetchMessages(activeRecipient);
      const interval = setInterval(() => fetchMessages(activeRecipient), 4000);
      return () => clearInterval(interval);
    }
  }, [activeRecipient, activeGroup]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadSavedGroups = () => {
    try {
      const saved = localStorage.getItem(`groups_${userEmail}`);
      if (saved) {
        setUserGroups(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getDeletedChats = (): string[] => {
    try {
      const saved = localStorage.getItem(`deleted_chats_${userEmail}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await api.get(`/chats/conversations?email=${encodeURIComponent(userEmail)}`);
      const rawData = response.data || [];
      const deletedChats = getDeletedChats();

      // Case-insensitive filtering of self & deleted conversations
      const validConvs = rawData.filter((c: any) => {
        const sender = (c.senderEmail || '').toLowerCase();
        const recipient = (c.recipientEmail || '').toLowerCase();
        const me = userEmail.toLowerCase();
        const other = sender === me ? recipient : sender;
        if (!other || other === me) return false;
        if (deletedChats.includes(other)) return false;
        return true;
      });

      // Sort by recent timestamp descending
      validConvs.sort((a: any, b: any) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return timeB - timeA;
      });

      setConversations(validConvs);

      // Auto-select first conversation ONLY ONCE on initial load when nothing has EVER been selected!
      if (
        validConvs.length > 0 &&
        !activeRecipientRef.current &&
        !activeGroupRef.current &&
        !isComposingRef.current &&
        !initialAutoSelectDoneRef.current
      ) {
        initialAutoSelectDoneRef.current = true;
        const sender = (validConvs[0].senderEmail || '').toLowerCase();
        const recipient = (validConvs[0].recipientEmail || '').toLowerCase();
        const me = userEmail.toLowerCase();
        const firstOther = sender === me ? recipient : sender;
        if (firstOther && firstOther !== me) {
          setActiveRecipient(firstOther);
        }
      } else if (validConvs.length === 0 && !activeRecipientRef.current && !activeGroupRef.current) {
        setIsComposing(true);
      }
    } catch (err: any) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoadingConvs(false);
    }
  };

  const fetchContacts = async () => {
    setLoadingContacts(true);
    try {
      const [facRes, studRes, appRes] = await Promise.all([
        api.get('/users/profile/all/faculty').catch(() => ({ data: [] })),
        api.get('/users/profile/all/students').catch(() => ({ data: [] })),
        api.get('/applications').catch(() => ({ data: [] })),
      ]);

      const map: Record<string, any> = {};

      const allApps = appRes.data || [];
      const selectedInternEmails = new Set<string>();
      const internTitleMap: Record<string, string> = {};

      allApps.forEach((app: any) => {
        const st = String(app.status || '').toUpperCase();
        if (['ACCEPTED', 'SELECTED', 'HIRED'].includes(st)) {
          if (app.studentEmail) {
            const lowerEmail = app.studentEmail.toLowerCase();
            selectedInternEmails.add(lowerEmail);
            internTitleMap[lowerEmail] = app.internshipTitle || 'Accepted Intern';
          }
        }
      });

      const facList = (facRes.data || []).map((f: any) => {
        const realName = formatRealName(f.email, f.firstName, f.lastName);
        const item = {
          email: f.email,
          name: realName,
          role: f.designation || 'Faculty Mentor',
          department: f.department || 'Computer Science & Engineering',
          type: 'faculty',
          isSelectedForInternship: false,
        };
        if (f.email) map[f.email.toLowerCase()] = item;
        return item;
      });

      const studList = (studRes.data || []).map((s: any) => {
        const realName = formatRealName(s.email, s.firstName, s.lastName);
        const lowerEmail = (s.email || '').toLowerCase();
        const isSelected = selectedInternEmails.has(lowerEmail);
        const item = {
          email: s.email,
          name: realName,
          role: isSelected ? `Selected Intern (${internTitleMap[lowerEmail] || 'Accepted'})` : s.degreeProgram || 'Student Scholar',
          department: s.department || 'Student',
          type: 'student',
          isSelectedForInternship: isSelected,
          internshipTitle: internTitleMap[lowerEmail] || 'Accepted Intern',
        };
        if (s.email) map[lowerEmail] = item;
        return item;
      });

      setProfileMap(map);

      const combined = [...facList, ...studList].filter(
        (c) => c.email && c.email.toLowerCase() !== userEmail.toLowerCase()
      );
      setContacts(combined);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const fetchMessages = async (otherEmail: string) => {
    try {
      const response = await api.get(`/chats/history?user1=${encodeURIComponent(userEmail)}&user2=${encodeURIComponent(otherEmail)}`);
      setMessages(response.data || []);

      // Mark seen
      api.put(`/chats/seen?recipient=${encodeURIComponent(userEmail)}&sender=${encodeURIComponent(otherEmail)}`).catch(() => {});

      // Update local status of conversation to SEEN
      setConversations((prev) =>
        prev.map((c) => {
          const sender = (c.senderEmail || '').toLowerCase();
          if (sender === otherEmail.toLowerCase()) {
            return { ...c, status: 'SEEN' };
          }
          return c;
        })
      );
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const fetchGroupMessages = async (groupId: string) => {
    try {
      const response = await api.get(`/chats/group/${groupId}`);
      setMessages(response.data || []);
    } catch (err) {
      console.error('Error fetching group messages:', err);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, type: string = 'TEXT', fileUrl?: string, fileName?: string) => {
    e?.preventDefault();

    if (activeGroup) {
      if (!newMessage.trim() && !fileUrl) return;

      const groupMessageData = {
        senderEmail: userEmail,
        internshipGroupId: activeGroup.id,
        content: newMessage,
        messageType: type,
        fileUrl,
        fileName,
      };

      try {
        const response = await api.post('/chats/send', groupMessageData);
        setMessages((prev) => [...prev, response.data]);
        setNewMessage('');
        setShowEmojis(false);
        fetchGroupMessages(activeGroup.id);
      } catch {
        alert('Failed to send group message');
      }
      return;
    }

    const targetRecipient = isComposing ? newRecipientEmail.trim() : activeRecipient;

    if (!targetRecipient || targetRecipient.toLowerCase() === userEmail.toLowerCase()) {
      alert('Please select a valid recipient email first.');
      return;
    }
    if (!newMessage.trim() && !fileUrl) return;

    // Un-delete if previously deleted
    const deleted = getDeletedChats().filter((e) => e !== targetRecipient.toLowerCase());
    localStorage.setItem(`deleted_chats_${userEmail}`, JSON.stringify(deleted));

    const messageData = {
      senderEmail: userEmail,
      recipientEmail: targetRecipient,
      content: newMessage,
      messageType: type,
      fileUrl,
      fileName,
    };

    try {
      const response = await api.post('/chats/send', messageData);
      setMessages((prev) => [...prev, response.data]);
      setNewMessage('');
      setShowEmojis(false);
      setActiveRecipient(targetRecipient);
      setIsComposing(false);
      fetchConversations();
    } catch {
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
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { fileUrl, fileName, messageType } = response.data;
      handleSendMessage(undefined, messageType, fileUrl, fileName);
    } catch {
      alert('Failed to upload file');
    }
  };

  const handleDeleteChat = async () => {
    if (!activeRecipient) return;

    const target = activeRecipient;
    try {
      await api.delete(`/chats/history?user1=${encodeURIComponent(userEmail)}&user2=${encodeURIComponent(target)}`).catch(() => {});

      const deleted = getDeletedChats();
      if (!deleted.includes(target.toLowerCase())) {
        deleted.push(target.toLowerCase());
        localStorage.setItem(`deleted_chats_${userEmail}`, JSON.stringify(deleted));
      }

      setConversations((prev) =>
        prev.filter((c) => {
          const sender = (c.senderEmail || '').toLowerCase();
          const recipient = (c.recipientEmail || '').toLowerCase();
          const me = userEmail.toLowerCase();
          const other = sender === me ? recipient : sender;
          return other !== target.toLowerCase();
        })
      );

      setShowDeleteConfirm(false);
      setMessages([]);
      setActiveRecipient(null);
      setIsComposing(true);
    } catch (e) {
      console.error(e);
      alert('Failed to delete chat history.');
    }
  };

  const handleCreateGroup = () => {
    if (isStudent) {
      alert('Group creation is restricted to Faculty Supervisors and Mentors.');
      return;
    }
    if (!groupTitle.trim()) {
      alert('Please enter a group title.');
      return;
    }
    if (selectedGroupMembers.length === 0) {
      alert('Please select at least 1 group member.');
      return;
    }

    const newGroup = {
      id: `group_${Date.now()}`,
      title: groupTitle.trim(),
      members: [userEmail, ...selectedGroupMembers],
      createdAt: new Date().toISOString(),
    };

    const updated = [newGroup, ...userGroups];
    setUserGroups(updated);
    localStorage.setItem(`groups_${userEmail}`, JSON.stringify(updated));

    setShowGroupModal(false);
    setGroupTitle('');
    setSelectedGroupMembers([]);

    setActiveGroup(newGroup);
    setActiveRecipient(null);
    setIsComposing(false);
  };

  const getContactInfo = (email: string) => {
    if (!email) return { name: 'User', email: '', role: '', department: '', type: 'user' };
    const lower = email.toLowerCase();
    if (profileMap[lower]) return profileMap[lower];

    const contact = contacts.find((c) => c.email.toLowerCase() === lower);
    if (contact) return contact;

    const name = formatRealName(email);
    return { name, email, role: 'User Contact', department: 'General', type: 'user' };
  };

  const selectChatRecipient = (email: string) => {
    if (email.toLowerCase() === userEmail.toLowerCase()) return;
    initialAutoSelectDoneRef.current = true;
    setActiveGroup(null);
    setActiveRecipient(email);
    setNewRecipientEmail(email);
    setIsComposing(false);
    if (onSelectChat) onSelectChat({ email, name: getContactInfo(email).name });
  };

  const filteredConversations = conversations.filter((conv) => {
    const sender = (conv.senderEmail || '').toLowerCase();
    const recipient = (conv.recipientEmail || '').toLowerCase();
    const me = userEmail.toLowerCase();
    const otherUser = sender === me ? recipient : sender;

    if (!otherUser || otherUser === me) return false;
    const info = getContactInfo(otherUser);

    const isUnread = sender !== me && conv.status !== 'SEEN';

    if (filterMode === 'UNREAD' && !isUnread) return false;
    if (filterMode === 'READ' && isUnread) return false;
    if (filterMode === 'FACULTY' && info.type !== 'faculty') return false;
    if (filterMode === 'STUDENT' && info.type !== 'student') return false;
    if (filterMode === 'GROUPS') return false;

    return (
      otherUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
      info.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const filteredContacts = contacts.filter((c) => {
    if (filterMode === 'FACULTY' && c.type !== 'faculty') return false;
    if (filterMode === 'STUDENT' && c.type !== 'student') return false;
    return (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.department && c.department.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const selectedInternContacts = contacts.filter((c) => c.isSelectedForInternship || c.type === 'student');
  const currentRecipientInfo = activeRecipient ? getContactInfo(activeRecipient) : null;

  return (
    <div className="flex flex-col h-[calc(100vh-135px)] min-h-[480px] max-h-[820px] gap-2 font-sans px-1 py-1">
      {/* Header */}
      <div className="flex items-center gap-3 flex-shrink-0 px-1 pt-1">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6366f1] via-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
          <MessageSquare size={20} />
        </div>
        <div>
          <h1 className="text-[22px] sm:text-[28px] font-black text-white tracking-tight leading-none">Messages & Communications</h1>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            Direct messaging with faculty mentors, project supervisors, and peers.
          </p>
        </div>
      </div>

      {/* Main Glassmorphic Container Card */}
      <div className="bg-[#071b2f] backdrop-blur-xl rounded-[28px] border border-white/10 shadow-[0_0_0_1px_rgba(148,163,184,0.08)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0">
        {/* Left Column: Sidebar Conversations & Groups */}
        <div className="lg:col-span-4 border-r border-white/10/70 flex flex-col h-full min-h-0 bg-slate-950/80/60 overflow-hidden">
          {/* Search & Filter Header */}
          <div className="p-3 border-b border-white/10/70 bg-[#0a1d31] backdrop-blur-sm space-y-2 flex-shrink-0">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search chats, groups, contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-7 py-2.5 bg-[#0a1d31] text-sm font-medium text-white rounded-full outline-none border border-white/10 placeholder:text-slate-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Comprehensive Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {(['ALL', 'UNREAD', 'READ', 'FACULTY', 'STUDENT', 'GROUPS'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition cursor-pointer shrink-0 uppercase tracking-wide ${
                    filterMode === mode
                      ? 'bg-[#6a4df0] text-white shadow-md shadow-indigo-500/20'
                      : 'bg-[#dfe4ef] text-slate-500 hover:bg-[#e9edf7]'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* List Items */}
          <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1">
            {/* User Groups Section */}
            {userGroups.length > 0 && (filterMode === 'ALL' || filterMode === 'GROUPS') && (
              <div className="mb-2">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2 mb-1 flex items-center gap-1">
                  <Users size={11} /> Team Groups ({userGroups.length})
                </div>
                {userGroups.map((g) => {
                  const isSelected = activeGroup?.id === g.id;
                  return (
                    <div
                      key={g.id}
                      onClick={() => {
                        setIsComposing(false);
                        setActiveRecipient(null);
                        setActiveGroup(g);
                      }}
                      className={`p-2.5 rounded-2xl cursor-pointer transition-all duration-150 flex items-center gap-2.5 border ${
                        isSelected
                          ? 'bg-indigo-50/90 border-[#6366f1]/50 shadow-sm shadow-indigo-500/10'
                          : 'bg-slate-900/80 hover:bg-slate-900/90/80 border-white/10/60'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-xs shadow-2xs shrink-0">
                        <Users size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <span className="text-xs font-extrabold text-white truncate">{g.title}</span>
                          <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 rounded">Group</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium truncate">
                          {g.members?.length || 0} members enrolled
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Direct Conversations List */}
            {filterMode !== 'GROUPS' && (
              <>
                {loadingConvs && conversations.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs font-medium flex flex-col items-center gap-2">
                    <Clock size={18} className="animate-spin text-indigo-500" />
                    <span>Loading recent chats…</span>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-4 text-center">
                    <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-[#6366f1] flex items-center justify-center mx-auto mb-1.5">
                      <MessageSquare size={18} />
                    </div>
                    <div className="text-xs font-bold text-slate-200">No chats found in this view</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 mb-2.5">Select a contact below to message.</div>

                    {contacts.length > 0 && (
                      <div className="text-left mt-2">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 px-1">
                          AVAILABLE DIRECTORY
                        </div>
                        <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
                          {filteredContacts.slice(0, 6).map((contact) => (
                            <div
                              key={contact.email}
                              onClick={() => selectChatRecipient(contact.email)}
                              className="p-2 rounded-xl bg-slate-900/80 hover:bg-indigo-50/80 border border-white/10/60 cursor-pointer transition flex items-center gap-2 group shadow-2xs"
                            >
                              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-extrabold text-xs flex items-center justify-center uppercase shrink-0">
                                {contact.name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-white truncate group-hover:text-[#6366f1]">
                                  {contact.name}
                                </div>
                                <div className="text-[9px] text-slate-400 truncate">{contact.role}</div>
                              </div>
                              <ChevronRight size={13} className="text-slate-300 group-hover:text-[#6366f1]" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const sender = (conv.senderEmail || '').toLowerCase();
                    const recipient = (conv.recipientEmail || '').toLowerCase();
                    const me = userEmail.toLowerCase();
                    const otherEmail = sender === me ? recipient : sender;

                    const isSelected = !isComposing && !activeGroup && activeRecipient?.toLowerCase() === otherEmail;
                    const info = getContactInfo(otherEmail);

                    const isUnread = sender !== me && conv.status !== 'SEEN';

                    return (
                      <div
                        key={conv.id || otherEmail}
                        onClick={() => selectChatRecipient(otherEmail)}
                        className={`p-3 rounded-[26px] cursor-pointer transition-all duration-150 flex items-center gap-3 group relative ${
                          isSelected
                            ? 'bg-[#dfe2ee] text-slate-800 shadow-inner'
                            : 'bg-transparent hover:bg-white/5'
                        }`}
                      >
                        <div className="relative shrink-0">
                          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#6d4fe4] to-violet-600 text-white font-extrabold text-lg flex items-center justify-center uppercase shadow-sm">
                            {info.name.charAt(0)}
                          </div>
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#0a1d31]" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <span className={`text-[18px] font-bold truncate ${isSelected ? 'text-slate-900' : 'text-white'}`}>
                              {info.name}
                            </span>
                            <span className={`text-[11px] font-medium ${isSelected ? 'text-slate-600' : 'text-slate-400'}`}>
                              {conv.timestamp
                                ? new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : ''}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-1 mt-1">
                            <p className={`text-[12px] font-medium truncate flex-1 ${isSelected ? 'text-slate-600' : 'text-slate-400'}`}>
                              {sender === me ? <span className="font-bold">You: </span> : ''}
                              {conv.messageType === 'TEXT' ? conv.content : `Sent a ${conv.messageType?.toLowerCase() || 'file'}`}
                            </p>
                            {isUnread && (
                              <span className="w-2.5 h-2.5 rounded-full bg-[#6d4fe4] ring-2 ring-white/50 shrink-0 animate-pulse" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Column: Chat Workspace */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-0 bg-[#02070d] overflow-hidden">
          {/* Active Header */}
          <div className="px-5 py-3 border-b border-white/10/70 flex items-center justify-between bg-slate-950/80/70 backdrop-blur-sm flex-shrink-0">
            {activeGroup ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-xs shadow-2xs">
                    <Users size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white leading-tight">{activeGroup.title}</div>
                    <div className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">
                      Group Workspace • {activeGroup.members?.length || 0} enrolled members
                    </div>
                  </div>
                </div>
              </div>
            ) : isComposing ? (
              <div className="w-full flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-100 text-[#6366f1] flex items-center justify-center">
                      <Plus size={14} />
                    </div>
                    <span className="text-xs font-black text-white uppercase tracking-wider">Compose New Message</span>
                  </div>
                  {conversations.length > 0 && (
                    <button
                      onClick={() => {
                        setIsComposing(false);
                        const sender = (conversations[0].senderEmail || '').toLowerCase();
                        const recipient = (conversations[0].recipientEmail || '').toLowerCase();
                        const me = userEmail.toLowerCase();
                        const firstOther = sender === me ? recipient : sender;
                        setActiveRecipient(firstOther);
                      }}
                      className="text-slate-400 hover:text-slate-400 text-xs flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <X size={14} /> Cancel
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-slate-400 shrink-0">To:</span>
                  <input
                    type="email"
                    placeholder="Enter recipient email or select a contact card below…"
                    value={newRecipientEmail}
                    onChange={(e) => setNewRecipientEmail(e.target.value)}
                    className="flex-1 px-3 py-1 bg-slate-900/80 border border-white/10 focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 rounded-xl text-xs font-semibold text-white outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>
            ) : activeRecipient ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6366f1] to-violet-600 text-white font-extrabold text-xs flex items-center justify-center uppercase shadow-2xs">
                      {currentRecipientInfo?.name.charAt(0)}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-950/400 ring-2 ring-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-white leading-tight">{currentRecipientInfo?.name}</span>
                      {currentRecipientInfo?.type === 'faculty' ? (
                        <span className="px-2 py-0.5 bg-amber-950/40 text-amber-700 font-bold rounded-full text-[9px] border border-amber-200/70 flex items-center gap-0.5">
                          <GraduationCap size={10} /> Faculty
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-blue-950/40 text-blue-700 font-bold rounded-full text-[9px] border border-blue-200/70 flex items-center gap-0.5">
                          <UserCheck size={10} /> Student
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">{activeRecipient}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 border border-rose-200/80 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Delete Conversation"
                  >
                    <Trash2 size={13} /> Delete Chat
                  </button>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-950/40 border border-emerald-200/60 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-950/400 animate-pulse" /> Active Now
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-200 font-bold text-xs">
                <Sparkles size={16} className="text-[#6366f1]" /> Start a new conversation
              </div>
            )}
          </div>

          {/* Stream Body */}
          <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-3 bg-gradient-to-b from-[#050b14] via-[#091321] to-[#02070d]">
            {isComposing || (!activeRecipient && !activeGroup) ? (
              <div className="p-4 max-w-xl mx-auto">
                <div className="text-center mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-100 to-violet-100 text-[#6366f1] flex items-center justify-center mx-auto mb-2 shadow-xs">
                    <SendHorizontal size={22} />
                  </div>
                  <h3 className="text-sm font-black text-white">Start a Conversation</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select a contact card below or enter an email address above to begin messaging.
                  </p>
                </div>

                <div className="bg-slate-900/80 rounded-2xl p-4 border border-white/10/80 shadow-xs">
                  <div className="text-[10px] font-black text-white mb-2.5 flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="uppercase tracking-wider">Available Directory ({contacts.length})</span>
                    <span className="text-[9px] text-indigo-600 font-bold">Select contact</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[240px] overflow-y-auto pr-1">
                    {contacts.length === 0 ? (
                      <div className="col-span-2 text-center py-6 text-xs text-slate-400 font-medium">
                        {loadingContacts ? 'Loading directory…' : 'No contacts found. Type an email address above.'}
                      </div>
                    ) : (
                      contacts.map((c) => (
                        <div
                          key={c.email}
                          onClick={() => selectChatRecipient(c.email)}
                          className={`p-2.5 rounded-xl border transition-all duration-150 cursor-pointer flex items-center gap-2.5 ${
                            (isComposing ? newRecipientEmail === c.email : activeRecipient === c.email)
                              ? 'bg-indigo-50/90 border-[#6366f1] shadow-2xs ring-2 ring-[#6366f1]/20'
                              : 'bg-slate-950/80/70 hover:bg-slate-900/80 hover:border-white/10 border-white/10/70 shadow-2xs'
                          }`}
                        >
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#6366f1] to-violet-600 text-white font-extrabold text-xs flex items-center justify-center uppercase shrink-0">
                            {c.name.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-white truncate">{c.name}</div>
                            <div className="text-[9px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                              {c.isSelectedForInternship ? (
                                <span className="px-1.5 py-0.2 bg-emerald-950/40 text-emerald-700 font-bold rounded text-[8px] border border-emerald-200 flex items-center gap-0.5">
                                  <CheckCircle2 size={9} /> Selected Intern
                                </span>
                              ) : c.type === 'faculty' ? (
                                <span className="px-1 py-0.1 bg-amber-950/40 text-amber-700 font-bold rounded text-[8px] border border-amber-200">
                                  Faculty
                                </span>
                              ) : (
                                <span className="px-1 py-0.1 bg-blue-950/40 text-blue-700 font-bold rounded text-[8px] border border-blue-200">
                                  Student
                                </span>
                              )}
                              <span className="truncate">{c.department || c.email}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center text-slate-600 flex flex-col items-center justify-center h-full">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-[#6366f1] flex items-center justify-center mb-2 shadow-xs">
                  <MessageSquare size={22} />
                </div>
                <div className="text-xs font-extrabold text-slate-800">No messages yet</div>
                <div className="text-[10px] text-slate-600 mt-0.5 max-w-xs">
                  Send a message below to start your conversation with {activeGroup ? activeGroup.title : currentRecipientInfo?.name}.
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const mine = (msg.senderEmail || '').toLowerCase() === userEmail.toLowerCase();
                const fullFileUrl = msg.fileUrl ? `${api.defaults.baseURL}${msg.fileUrl}` : null;

                const msgDate = new Date(msg.timestamp || Date.now());
                const prevMsgDate = idx > 0 ? new Date(messages[idx - 1].timestamp || Date.now()) : null;
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

                const senderInfo = getContactInfo(msg.senderEmail);

                return (
                  <div key={idx} className="w-full flex flex-col">
                    {showDateDivider && (
                      <div className="flex items-center gap-3 my-2.5">
                        <div className="flex-1 h-[1px] bg-slate-200/70" />
                        <span className="bg-slate-900/80 border border-white/10/80 text-slate-400 text-[9px] font-extrabold px-3 py-0.5 rounded-full shadow-2xs uppercase tracking-widest">
                          {formatDateStr(msgDate)}
                        </span>
                        <div className="flex-1 h-[1px] bg-slate-200/70" />
                      </div>
                    )}

                    <div className={`w-full flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                      {activeGroup && !mine && (
                        <span className="text-[9px] font-bold text-slate-600 mb-0.5 px-1">{senderInfo.name}</span>
                      )}
                      <div
                        className={`max-w-[72%] p-3 px-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                          mine
                            ? 'bg-gradient-to-r from-[#6366f1] to-indigo-600 text-white rounded-br-xs font-medium shadow-indigo-500/10'
                            : 'bg-[#0f172a] text-slate-100 border border-slate-700/80 rounded-bl-xs font-medium shadow-2xs'
                        }`}
                      >
                        {msg.messageType === 'IMAGE' ? (
                          <img
                            src={fullFileUrl || ''}
                            alt="attachment"
                            className="max-w-full rounded-xl cursor-pointer hover:opacity-95 transition"
                            onClick={() => window.open(fullFileUrl || '', '_blank')}
                          />
                        ) : msg.messageType === 'DOCUMENT' ? (
                          <a
                            href={fullFileUrl || ''}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 font-bold underline hover:opacity-90 transition"
                          >
                            <FileText size={15} /> {msg.fileName || 'Document'}
                          </a>
                        ) : (
                          <span className="block tracking-wide leading-relaxed font-normal">{msg.content}</span>
                        )}

                        <div
                          className={`flex items-center justify-end gap-1 mt-1 pt-0.5 border-t text-[9px] font-semibold ${
                            mine ? 'text-indigo-200 border-indigo-400/30' : 'text-slate-400 border-white/10'
                          }`}
                        >
                          <span>{formatTimeOnly(msgDate)}</span>
                          {mine && <CheckCheck size={11} className="text-white ml-0.5" />}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Text Box Input Area */}
          <div className="p-3 px-4 border-t border-white/10/80 bg-slate-900/80 flex-shrink-0 sticky bottom-0 z-20">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojis(!showEmojis)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-900/90 transition cursor-pointer"
                  title="Add Emoji"
                >
                  <Smile size={18} />
                </button>
                {showEmojis && (
                  <div className="absolute bottom-12 left-0 bg-slate-900/80 border border-white/10 rounded-2xl p-2.5 shadow-xl grid grid-cols-4 gap-1.5 z-30 min-w-[200px]">
                    {EMOJIS.map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => setNewMessage((prev) => prev + e)}
                        className="p-1.5 hover:bg-indigo-50 rounded-xl text-base transition text-center cursor-pointer"
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-900/90 transition cursor-pointer"
                title="Attach file"
              >
                <Paperclip size={18} />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />

              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={
                  activeGroup
                    ? `Message ${activeGroup.title}…`
                    : isComposing && !newRecipientEmail
                    ? 'Select recipient above or choose a contact card…'
                    : `Message ${currentRecipientInfo?.name || newRecipientEmail || 'user'}…`
                }
                className="flex-1 px-4 py-2.5 bg-slate-900/90/80 focus:bg-slate-900/80 text-xs font-medium text-white rounded-xl outline-none border border-transparent focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 transition-all placeholder:text-slate-400"
              />

              <button
                type="submit"
                disabled={!newMessage.trim() || (!activeGroup && isComposing && !newRecipientEmail)}
                className="px-4.5 py-2.5 bg-gradient-to-r from-[#6366f1] to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Send size={14} /> Send
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Delete Chat Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/80 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-white/10/90 flex flex-col gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-1">
              <Trash2 size={24} />
            </div>
            <h3 className="text-base font-black text-white">Delete Conversation?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to delete all chat history with{' '}
              <strong className="text-white">{currentRecipientInfo?.name}</strong>? This action cannot be undone.
            </p>

            <div className="flex items-center gap-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 bg-slate-900/90 hover:bg-slate-200 text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteChat}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
              >
                Delete Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Creation Modal (Faculty / Admin Only) */}
      {!isStudent && showGroupModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/80 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-white/10/90 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-[#6366f1] flex items-center justify-center">
                  <Users size={16} />
                </div>
                <h3 className="text-sm font-black text-white">Create Team Group Chat</h3>
              </div>
              <button
                onClick={() => setShowGroupModal(false)}
                className="text-slate-400 hover:text-slate-400 p-1 rounded-lg hover:bg-slate-900/90 transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Group Title</label>
                <input
                  type="text"
                  placeholder="e.g. AI Internship Team, MCA Project Group"
                  value={groupTitle}
                  onChange={(e) => setGroupTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900/90 focus:bg-slate-900/80 text-xs font-semibold text-white rounded-xl outline-none border border-transparent focus:border-[#6366f1]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-200">Select Group Members</label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setGroupFilterTab('SELECTED_INTERNS')}
                      className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase transition ${
                        groupFilterTab === 'SELECTED_INTERNS'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-900/90 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      Selected Interns ({selectedInternContacts.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setGroupFilterTab('ALL')}
                      className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase transition ${
                        groupFilterTab === 'ALL'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-900/90 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      All Contacts ({contacts.length})
                    </button>
                  </div>
                </div>

                <div className="max-h-[210px] overflow-y-auto space-y-1 p-2 bg-slate-950/80 rounded-xl border border-white/10/70">
                  {(groupFilterTab === 'SELECTED_INTERNS' ? selectedInternContacts : contacts).length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400 font-medium">
                      No selected interns found. Switch to "All Contacts" tab to select members.
                    </div>
                  ) : (
                    (groupFilterTab === 'SELECTED_INTERNS' ? selectedInternContacts : contacts).map((c) => {
                      const isChecked = selectedGroupMembers.includes(c.email);
                      return (
                        <div
                          key={c.email}
                          onClick={() => {
                            if (isChecked) {
                              setSelectedGroupMembers((prev) => prev.filter((e) => e !== c.email));
                            } else {
                              setSelectedGroupMembers((prev) => [...prev, c.email]);
                            }
                          }}
                          className={`p-2 rounded-xl cursor-pointer flex items-center justify-between border transition ${
                            isChecked ? 'bg-indigo-50 border-[#6366f1]' : 'bg-slate-900/80 border-white/10/60 hover:bg-slate-900/90'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-[#6366f1] text-white font-bold text-xs flex items-center justify-center uppercase shrink-0">
                              {c.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-white truncate">{c.name}</span>
                                {c.isSelectedForInternship && (
                                  <span className="px-1.5 py-0.2 bg-emerald-950/40 text-emerald-700 font-extrabold text-[8px] rounded border border-emerald-200 flex items-center gap-0.5 shrink-0">
                                    <CheckCircle2 size={8} /> Intern
                                  </span>
                                )}
                              </div>
                              <div className="text-[9px] text-slate-400 truncate">{c.role}</div>
                            </div>
                          </div>
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border ${
                              isChecked ? 'bg-[#6366f1] border-[#6366f1] text-white' : 'border-white/10 bg-slate-900/80'
                            }`}
                          >
                            {isChecked && <Check size={12} />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setShowGroupModal(false)}
                className="px-4 py-2 bg-slate-900/90 hover:bg-slate-200 text-slate-400 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                className="px-4 py-2 bg-[#6366f1] hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm cursor-pointer"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesView;