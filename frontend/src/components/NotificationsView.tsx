import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Clock,
  Inbox,
  Briefcase,
  Target,
  Calendar,
  Sparkles,
  Trash2,
} from 'lucide-react';

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type?: string;
}

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: number) => void;
  onDelete?: (id: number) => void;
  loading?: boolean;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications = [],
  onMarkAsRead,
  onDelete,
  loading,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('unread');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[120px]">
        <div className="w-5 h-5 border-2 border-purple-500/30 border-t-[#6b21a8] rounded-full animate-spin" />
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const readCount = notifications.filter((n) => n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  const toggleSelected = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectVisible = () => {
    const visibleIds = filteredNotifications.map((n) => n.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleMarkSelectedAsRead = () => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach((id) => onMarkAsRead(id));
    setSelectedIds([]);
  };

  const getNotificationIcon = (title: string, message: string) => {
    const text = (title + ' ' + message).toLowerCase();
    if (text.includes('project') || text.includes('task') || text.includes('report'))
      return <Target size={13} className="text-[#6b21a8]" />;
    if (
      text.includes('application') ||
      text.includes('status') ||
      text.includes('shortlist') ||
      text.includes('selected') ||
      text.includes('rejected')
    )
      return <Briefcase size={13} className="text-blue-600" />;
    if (
      text.includes('meeting') ||
      text.includes('interview') ||
      text.includes('schedule') ||
      text.includes('meet')
    )
      return <Calendar size={13} className="text-emerald-600" />;
    return <Sparkles size={13} className="text-amber-500" />;
  };

  const handleNotificationClick = (n: NotificationItem) => {
    if (!n.isRead) {
      onMarkAsRead(n.id);
    }

    const text = (n.title + ' ' + n.message).toLowerCase();
    const isFaculty = window.location.pathname.startsWith('/faculty');

    if (
      text.includes('meeting') ||
      text.includes('interview') ||
      text.includes('schedule') ||
      text.includes('meet')
    ) {
      navigate(isFaculty ? '/faculty/schedules' : '/student/meetings');
    } else if (
      text.includes('project') ||
      text.includes('task') ||
      text.includes('report') ||
      text.includes('weekly') ||
      text.includes('revision')
    ) {
      navigate(isFaculty ? '/faculty/projects' : '/student/projects');
    } else if (
      text.includes('application') ||
      text.includes('shortlist') ||
      text.includes('status') ||
      text.includes('candidate') ||
      text.includes('applied') ||
      text.includes('selected') ||
      text.includes('rejected')
    ) {
      navigate(isFaculty ? '/faculty/applicants' : '/student/applications');
    } else {
      navigate(isFaculty ? '/faculty' : '/student');
    }
  };

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Compact Header & Filter Toolbar */}
      <div className="flex items-center justify-between gap-2 flex-wrap pb-1">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-black text-white tracking-tight">Notifications</h1>
          <span className="px-2 py-0.5 bg-purple-100/70 text-[#6b21a8] rounded-full text-[11px] font-extrabold flex items-center gap-1">
            <Bell size={11} /> {unreadCount}
          </span>
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handleMarkSelectedAsRead}
              className="px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25"
            >
              Mark selected as read
            </button>
          )}

          <label className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-900/80 text-slate-300 border border-white/10 text-[11px] font-bold cursor-pointer">
            <input
              type="checkbox"
              checked={filteredNotifications.length > 0 && filteredNotifications.every((n) => selectedIds.includes(n.id))}
              onChange={toggleSelectVisible}
              className="h-3.5 w-3.5 accent-[#6b21a8] cursor-pointer"
            />
            Select all
          </label>
        </div>

        {/* Compact Filters */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
              filter === 'all'
                ? 'bg-[#6b21a8] text-white'
                : 'bg-slate-900/80 text-slate-400 hover:bg-purple-950/40 border border-white/10'
            }`}
          >
            All ({notifications.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
              filter === 'unread'
                ? 'bg-[#6b21a8] text-white'
                : 'bg-slate-900/80 text-slate-400 hover:bg-purple-950/40 border border-white/10'
            }`}
          >
            Unread ({unreadCount})
          </button>

          <button
            type="button"
            onClick={() => setFilter('read')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
              filter === 'read'
                ? 'bg-[#6b21a8] text-white'
                : 'bg-slate-900/80 text-slate-400 hover:bg-purple-950/40 border border-white/10'
            }`}
          >
            Read ({readCount})
          </button>
        </div>
      </div>

      {/* Ultra-compact Notifications List */}
      <div className="bg-slate-900/90 backdrop-blur-xs rounded-xl border border-white/10 shadow-2xs overflow-hidden p-1.5 space-y-1">
        {filteredNotifications.length === 0 ? (
          <div className="py-6 px-3 text-center">
            <Inbox size={26} className="mx-auto mb-1 text-slate-300" />
            <div className="text-xs font-bold text-slate-200">No notifications</div>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const isSelected = selectedIds.includes(n.id);

            return (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`py-1.5 px-2.5 rounded-lg border transition flex items-center justify-between gap-2.5 cursor-pointer hover:border-purple-300 ${
                  !n.isRead
                    ? 'bg-purple-950/40/50 border-purple-500/30/80 font-medium'
                    : 'bg-slate-950/80/40 border-white/10 hover:bg-slate-900/90/50'
                } ${isSelected ? 'ring-1 ring-[#6b21a8] border-[#6b21a8]/70' : ''}`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggleSelected(n.id)}
                    className="h-3.5 w-3.5 accent-[#6b21a8] cursor-pointer"
                    title="Select notification"
                  />

                  <span
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      !n.isRead ? 'bg-[#6b21a8]' : 'bg-slate-300 opacity-50'
                    }`}
                  />

                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
                      !n.isRead ? 'bg-purple-100/90' : 'bg-slate-900/90'
                    }`}
                  >
                    {getNotificationIcon(n.title, n.message)}
                  </div>

                  <div className="min-w-0 flex-1 flex items-center gap-2">
                    <span className="text-xs font-bold text-white truncate shrink-0 max-w-[200px]">
                      {n.title}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate hidden sm:inline">
                      — {n.message}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 whitespace-nowrap">
                    <Clock size={9} className="text-slate-400" />
                    {new Date(n.timestamp).toLocaleDateString([], {
                      day: '2-digit',
                      month: 'short',
                    })}
                    ,{' '}
                    {new Date(n.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onDelete) onDelete(n.id);
                    }}
                    title="Delete notification"
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationsView;