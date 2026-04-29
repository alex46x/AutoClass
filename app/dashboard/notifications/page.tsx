import { getMyNotifications, markAllRead } from '@/app/actions/notifications';
import { Bell, CheckCheck, Inbox } from 'lucide-react';
import MarkAllReadButton from './MarkAllReadButton';

export default async function NotificationsPage() {
  const notifications = await getMyNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const timeAgo = (date: Date | string) => {
    const now = new Date();
    const d = new Date(date);
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Notifications
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount} new</span>
            )}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">All your alerts, approvals, and announcements in one place.</p>
        </div>
        {unreadCount > 0 && <MarkAllReadButton />}
      </header>

      {notifications.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center shadow-sm flex flex-col items-center gap-4">
          <Inbox className="w-14 h-14 text-slate-300 dark:text-slate-600" />
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">All Caught Up!</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">You have no notifications yet.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`flex items-start gap-4 px-6 py-5 transition-colors ${!n.isRead ? 'bg-indigo-50/60 dark:bg-indigo-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}
            >
              {/* Unread dot */}
              <div className="mt-1 shrink-0">
                {!n.isRead
                  ? <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 block" />
                  : <span className="w-2.5 h-2.5 rounded-full bg-transparent block" />
                }
              </div>

              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm ${!n.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                  {n.title}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{n.message}</p>
              </div>

              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium shrink-0">
                {timeAgo(n.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
