import React, { useState, useEffect, useCallback } from 'react';
import { notificationAPI } from '../services/api';
import type { NotificationDTO, NotificationType } from '../types';
import {
  Bell, CheckCheck, Droplets, Award, Activity, Info,
  AlertTriangle, Heart, RefreshCw, Loader2, BellOff, Zap
} from 'lucide-react';

/* ─────────────────────── helpers ─────────────────────── */

function notifIcon(type: NotificationType) {
  switch (type) {
    case 'BLOOD_REQUEST_MATCH':    return <Droplets className="w-5 h-5 text-blood-400" />;
    case 'DONATION_ACCEPTED':      return <Heart className="w-5 h-5 text-emerald-400 fill-emerald-400/30" />;
    case 'DONATION_STATUS_UPDATE': return <Activity className="w-5 h-5 text-sky-400" />;
    case 'REWARD_EARNED':          return <Award className="w-5 h-5 text-amber-400" />;
    case 'URGENT_ALERT':           return <AlertTriangle className="w-5 h-5 text-blood-400" />;
    case 'SYSTEM':
    default:                       return <Info className="w-5 h-5 text-neutral-400" />;
  }
}

function notifTheme(type: NotificationType) {
  switch (type) {
    case 'BLOOD_REQUEST_MATCH':    return { icon: 'bg-blood-950/60 border-blood-600/40',  card: 'border-blood-700/20',  badge: 'bg-blood-950/40 text-blood-400 border-blood-600/30',   dot: 'bg-blood-500' };
    case 'DONATION_ACCEPTED':      return { icon: 'bg-emerald-950/60 border-emerald-600/40', card: 'border-emerald-700/20', badge: 'bg-emerald-950/40 text-emerald-400 border-emerald-600/30', dot: 'bg-emerald-500' };
    case 'DONATION_STATUS_UPDATE': return { icon: 'bg-sky-950/60 border-sky-600/40',      card: 'border-sky-700/20',    badge: 'bg-sky-950/40 text-sky-400 border-sky-600/30',         dot: 'bg-sky-500' };
    case 'REWARD_EARNED':          return { icon: 'bg-amber-950/60 border-amber-600/40',  card: 'border-amber-700/20',  badge: 'bg-amber-950/40 text-amber-400 border-amber-600/30',   dot: 'bg-amber-500' };
    case 'URGENT_ALERT':           return { icon: 'bg-blood-950/80 border-blood-500/60',  card: 'border-blood-600/40',  badge: 'bg-blood-950/60 text-blood-400 border-blood-500/40',   dot: 'bg-blood-600' };
    default:                       return { icon: 'bg-neutral-900 border-neutral-700',    card: 'border-neutral-800',   badge: 'bg-neutral-900 text-neutral-400 border-neutral-700',   dot: 'bg-neutral-500' };
  }
}

function typeLabel(type: NotificationType): string {
  switch (type) {
    case 'BLOOD_REQUEST_MATCH':    return 'Blood Match';
    case 'DONATION_ACCEPTED':      return 'Donation';
    case 'DONATION_STATUS_UPDATE': return 'Status Update';
    case 'REWARD_EARNED':          return 'Reward';
    case 'URGENT_ALERT':           return 'Urgent Alert';
    default:                       return 'System';
  }
}

function fmtTime(dt: string): string {
  if (!dt) return '';
  return new Date(dt).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return fmtTime(dateStr);
}

/* ─────────────────────── component ─────────────────────── */

type Tab = 'unread' | 'all';

export const Notifications: React.FC = () => {
  const [tab, setTab] = useState<Tab>('unread');
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  /* ── Fetch ── */
  const fetch = useCallback(async (mode: Tab) => {
    setIsLoading(true);
    try {
      const data = await (mode === 'all'
        ? notificationAPI.getAll()
        : notificationAPI.getUnread());
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(tab); }, [tab, fetch]);

  /* ── Mark single as read ── */
  const markRead = async (n: NotificationDTO) => {
    if (n.read) return;
    setMarkingId(n.id);
    try {
      await notificationAPI.markAsRead(n.id);
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
    } catch { /* silent */ }
    finally { setMarkingId(null); }
  };

  /* ── Mark all as read ── */
  const markAllRead = async () => {
    const unread = notifications.filter(x => !x.read);
    if (unread.length === 0) return;
    setIsMarkingAll(true);
    try {
      await Promise.allSettled(unread.map(n => notificationAPI.markAsRead(n.id)));
      setNotifications(prev => prev.map(x => ({ ...x, read: true })));
    } catch { /* silent */ }
    finally { setIsMarkingAll(false); }
  };

  const refresh = () => fetch(tab);

  /* ─────────────────────── render ─────────────────────── */
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-100 flex items-center gap-3">
            <div className="relative">
              <Bell className="w-8 h-8 text-blood-500" />
              {unreadCount > 0 && tab === 'unread' && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-blood-600 border-2 border-neutral-950 text-white text-[9px] font-extrabold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            Notifications
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            {tab === 'unread'
              ? unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'
              : `${notifications.length} total notification${notifications.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mark all read */}
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              disabled={isMarkingAll}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 hover:border-emerald-600/40 hover:bg-emerald-950/20 text-neutral-300 hover:text-emerald-400 text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-60"
            >
              {isMarkingAll
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <CheckCheck className="w-4 h-4" />
              }
              Mark all read
            </button>
          )}

          {/* Refresh */}
          <button
            onClick={refresh}
            disabled={isLoading}
            className="p-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200 rounded-xl transition-all duration-200"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mb-6 border-b border-neutral-900">
        {(['unread', 'all'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-all duration-200 capitalize ${
              tab === t
                ? 'border-blood-500 text-blood-400 bg-blood-950/10'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {t === 'unread' ? 'Unread' : 'All'}
            {t === 'unread' && unreadCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-blood-600 text-white text-[9px] font-extrabold">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blood-500" />
          <p className="text-sm text-neutral-500">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
            <BellOff className="w-7 h-7 text-neutral-600" />
          </div>
          <div>
            <p className="text-neutral-400 font-semibold">
              {tab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
            <p className="text-sm text-neutral-600 mt-1">
              {tab === 'unread'
                ? "You're all caught up! Switch to 'All' to see past notifications."
                : 'Notifications will appear here when there is activity.'}
            </p>
          </div>
          {tab === 'unread' && (
            <button
              onClick={() => setTab('all')}
              className="px-4 py-2 text-sm font-semibold text-blood-400 hover:text-blood-300 border border-blood-600/30 hover:border-blood-500/50 rounded-xl bg-blood-950/20 transition-all"
            >
              View all notifications
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notif => {
            const theme = notifTheme(notif.type);
            const isMarking = markingId === notif.id;
            return (
              <div
                key={notif.id}
                onClick={() => markRead(notif)}
                className={`relative rounded-2xl border p-5 transition-all duration-200 cursor-pointer group ${
                  notif.read
                    ? `bg-neutral-950/60 ${theme.card} opacity-70 hover:opacity-90`
                    : `bg-neutral-950 ${theme.card} hover:bg-neutral-900/60`
                }`}
              >
                {/* Unread left accent strip */}
                {!notif.read && (
                  <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${theme.dot}`} />
                )}

                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border ${theme.icon}`}>
                    {isMarking
                      ? <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                      : notifIcon(notif.type)}
                  </div>

                  {/* Body */}
                  <div className="flex-grow min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${theme.badge}`}>
                          {typeLabel(notif.type)}
                        </span>
                        {!notif.read && (
                          <span className="text-[10px] font-bold text-blood-400 flex items-center gap-0.5">
                            <Zap className="w-2.5 h-2.5" /> New
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-neutral-500 whitespace-nowrap flex-shrink-0">
                        {timeAgo(notif.createdAt)}
                      </span>
                    </div>

                    <h3 className={`text-sm font-bold mt-1.5 ${notif.read ? 'text-neutral-400' : 'text-neutral-100'}`}>
                      {notif.title}
                    </h3>
                    <p className={`text-sm mt-0.5 leading-relaxed ${notif.read ? 'text-neutral-600' : 'text-neutral-400'}`}>
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[10px] text-neutral-600">
                        {fmtTime(notif.createdAt)}
                      </span>
                      {!notif.read && !isMarking && (
                        <span className="text-[10px] text-neutral-500 group-hover:text-blood-400 transition-colors font-semibold">
                          Click to mark as read →
                        </span>
                      )}
                      {notif.read && (
                        <span className="text-[10px] text-neutral-600 flex items-center gap-1">
                          <CheckCheck className="w-3 h-3" /> Read
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
