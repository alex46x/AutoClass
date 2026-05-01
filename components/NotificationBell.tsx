'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCheck, Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { markAllRead, markOneRead } from '@/app/actions/notifications';

interface Notification {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkAll = async () => {
    await markAllRead();
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const handleSelect = async (n: Notification) => {
    setSelectedNotification(n);
    if (!n.isRead) {
      await markOneRead(n.id);
      setNotifications(notifications.map(notif => 
        notif.id === n.id ? { ...notif, isRead: true } : notif
      ));
    }
  };

  const timeAgo = (date: Date) => {
    const now = new Date();
    const d = new Date(date);
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) fetchNotifications(); }}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-96 max-h-[480px] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-500" />
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAll}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-10 text-center flex flex-col items-center gap-3">
                  <Inbox className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => handleSelect(n)}
                      className={`px-5 py-4 cursor-pointer transition-colors ${!n.isRead ? 'bg-indigo-50/70 dark:bg-indigo-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                    >
                      <div className="flex items-start gap-3">
                        {!n.isRead && <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />}
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <p className={`text-sm font-bold truncate ${!n.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                            {n.title}
                          </p>
                          <div className="mt-0.5">
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 break-words">
                              {n.message}
                            </p>
                            {n.message.length > 80 && (
                              <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-semibold mt-1 inline-block">
                                ... see more
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
                            {timeAgo(n.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedNotification && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#fcfcfc] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] my-auto"
            >
              {/* Header - Navy Blue Gradient */}
              <div className="bg-gradient-to-r from-[#000080] via-[#001f5c] to-[#000080] px-6 py-5 sm:py-6 relative shrink-0 flex items-center justify-center">
                <h3 className="text-xl font-bold text-white text-center px-10 sm:px-16 break-words max-w-full">
                  {selectedNotification.title}
                </h3>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="absolute right-4 top-4 sm:right-5 sm:top-5 text-white/80 hover:text-white transition-colors flex items-center justify-center p-1.5 rounded-full hover:bg-white/10"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Body - Scrollable & Center Aligned */}
              <div className="p-8 md:p-10 overflow-y-auto custom-scrollbar flex-1 flex flex-col justify-center text-center">
                <p className="text-slate-800 text-lg leading-relaxed font-medium whitespace-pre-wrap">
                  {selectedNotification.message}
                </p>
                
                <div className="mt-8 pt-4 border-t border-slate-200 text-xs text-slate-500 font-bold uppercase tracking-wider flex justify-center gap-2 items-center">
                  <span>Received:</span>
                  <span>{new Date(selectedNotification.createdAt).toLocaleString()}</span>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
